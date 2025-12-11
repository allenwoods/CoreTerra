import { useState, useMemo } from 'react';
import type { Task, TasksByStatus } from '@/types/task';
import { getPriorityColor } from '@/types/task';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameDay, addMonths, subMonths } from 'date-fns';
import { getIcon } from '@/lib/iconMap';

interface CalendarViewProps {
  tasks: TasksByStatus;
  onTaskClick: (task: Task) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const ChevronLeft = getIcon('chevron_right'); // Will flip with transform
  const ChevronRight = getIcon('chevron_right');

  // Generate all days in the current month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the week (0 = Sunday)
  const firstDayOfWeek = getDay(monthStart);

  // Add padding days at the start
  const calendarDays = useMemo(() => {
    const paddingDays = Array(firstDayOfWeek).fill(null);
    return [...paddingDays, ...daysInMonth];
  }, [firstDayOfWeek, daysInMonth]);

  // Get active tasks (not done) that have a due date
  const activeTasks = useMemo(() => {
    return [...tasks.next, ...tasks.waiting].filter((t) => t.due_date);
  }, [tasks]);

  // Get tasks for a specific day
  const getTasksForDay = (day: Date | null): Task[] => {
    if (!day) return [];

    return activeTasks.filter((task) => {
      if (!task.due_date) return false;
      try {
        const taskDate = new Date(task.due_date);
        return isSameDay(taskDate, day);
      } catch {
        return false;
      }
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(today);

  return (
    <div className="flex-1 p-6 bg-gray-50/30 overflow-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col">
        {/* Calendar Header - Navigation */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day ? isSameDay(day, today) : false;

            return (
              <div
                key={i}
                className={`bg-white p-2 min-h-[100px] flex flex-col gap-1 ${
                  day ? 'hover:bg-gray-50' : 'bg-gray-50/50'
                } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
              >
                {day && (
                  <span
                    className={`text-xs font-medium mb-1 ${
                      isToday ? 'text-primary font-bold' : 'text-gray-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                )}

                {/* Tasks for this day */}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`text-[10px] p-1 rounded border border-gray-100 cursor-pointer truncate ${getPriorityColor(task.priority)} opacity-80 hover:opacity-100 transition-opacity`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
