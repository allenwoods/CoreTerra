import { memo, type CSSProperties } from 'react';
import { Link2 } from 'lucide-react';
import type { Task } from '@/types/task';
import { getIcon } from '@/lib/iconMap';

interface TaskCardProps {
  task: Task;
  isDone?: boolean;
  onClick: (task: Task) => void;
  style?: CSSProperties;
}

function TaskCard({ task, isDone = false, onClick, style }: TaskCardProps) {
  const EditIcon = getIcon('edit_document');
  const hasSubtaskIndicator = task.parent_id;

  return (
    <div
      onClick={() => onClick(task)}
      style={style}
      className={`bg-white border border-gray-200 p-3 rounded-lg cursor-pointer ${
        isDone ? 'opacity-60' : ''
      } hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm group animate-in fade-in slide-in-from-bottom-2`}
    >
      {/* Subtask indicator */}
      {hasSubtaskIndicator && (
        <div className="flex items-center gap-1 text-xs text-blue-500 mb-1.5">
          <Link2 className="w-3 h-3" />
          <span>子任务</span>
        </div>
      )}

      {/* Title and Edit Icon */}
      <div className="flex justify-between items-start mb-2">
        <p
          className={`text-sm text-gray-800 font-medium leading-snug ${
            isDone ? 'line-through decoration-gray-400 text-gray-500' : ''
          }`}
        >
          {task.title}
        </p>
        <EditIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100" />
      </div>

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Task ID */}
          <span className="text-gray-400 font-mono text-[11px]">{task.id}</span>

          {/* Priority Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${task.priorityColor}`}
          >
            {task.priority}
          </span>

          {/* Project Tag */}
          {task.project && (
            <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
              {task.project}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee && (
          <div
            className={`w-6 h-6 rounded-full ${task.assignee.color} text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm`}
            title={task.assignee.name}
          >
            {task.assignee.initial}
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(TaskCard);
