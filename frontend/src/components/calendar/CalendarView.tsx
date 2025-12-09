import { useMemo } from 'react';
import type { Task, TasksByStatus } from '@/types/task';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameDay } from 'date-fns';

interface CalendarViewProps {
  tasks: TasksByStatus;
  onTaskClick: (task: Task) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

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

  return (
    <div className="flex-1 p-6 bg-gray-50/30 overflow-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col">
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
                    className={`text-[10px] p-1 rounded border border-gray-100 cursor-pointer truncate ${task.priorityColor} opacity-80 hover:opacity-100 transition-opacity`}
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
