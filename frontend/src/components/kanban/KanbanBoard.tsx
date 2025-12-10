import { useState, useMemo } from 'react';
import type { Task, TasksByStatus } from '@/types/task';
import KanbanColumn from './KanbanColumn';
import CalendarView from '@/components/calendar/CalendarView';
import { getIcon } from '@/lib/iconMap';

interface KanbanBoardProps {
  tasks: TasksByStatus;
  onTaskClick: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const [view, setView] = useState<'board' | 'calendar'>('board');
  const [filterText, setFilterText] = useState('');

  const SearchIcon = getIcon('search');

  // Filter tasks based on search text
  const filterTasks = (taskList: Task[]): Task[] => {
    if (!filterText) return taskList;
    const lower = filterText.toLowerCase();
    return taskList.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.id.toLowerCase().includes(lower) ||
        t.project?.toLowerCase().includes(lower)
    );
  };

  const filteredTasks = useMemo(
    () => ({
      next: filterTasks(tasks.next),
      waiting: filterTasks(tasks.waiting),
      done: filterTasks(tasks.done),
    }),
    [tasks, filterText]
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
      {/* Header with Search and View Toggle */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
            placeholder="Filter tasks..."
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'board'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setView('board')}
          >
            Board
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === 'board' ? (
        <div className="flex-1 p-4 sm:p-6 flex gap-4 sm:gap-6 overflow-x-auto bg-gray-50/30 scrollbar-thin">
          <KanbanColumn
            title="Next"
            count={filteredTasks.next.length}
            tasks={filteredTasks.next}
            onTaskClick={onTaskClick}
          />
          <KanbanColumn
            title="Waiting For"
            count={filteredTasks.waiting.length}
            tasks={filteredTasks.waiting}
            onTaskClick={onTaskClick}
          />
          <KanbanColumn
            title="Done"
            count={filteredTasks.done.length}
            tasks={filteredTasks.done}
            isDone={true}
            onTaskClick={onTaskClick}
          />
        </div>
      ) : (
        <CalendarView tasks={tasks} onTaskClick={onTaskClick} />
      )}
    </div>
  );
}
