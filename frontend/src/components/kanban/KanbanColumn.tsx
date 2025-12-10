import type { Task } from '@/types/task';
import TaskCard from './TaskCard';
import { getIcon } from '@/lib/iconMap';

interface KanbanColumnProps {
  title: string;
  count: number;
  tasks: Task[];
  isDone?: boolean;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({
  title,
  count,
  tasks,
  isDone = false,
  onTaskClick,
}: KanbanColumnProps) {
  const MoreIcon = getIcon('more_horiz');

  return (
    <div className="w-[280px] sm:w-[320px] flex-shrink-0 flex flex-col bg-gray-50/50 rounded-xl h-full min-h-[400px]">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h2>
          <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-3 overflow-y-auto px-2 pb-4 flex-1 scrollbar-thin">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isDone={isDone}
            onClick={onTaskClick}
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
