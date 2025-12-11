import { memo } from 'react';
import { Calendar, Folder, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/types/task';
import { PRIORITY_COLORS } from '@/types/task';

interface InboxTaskRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string, selected: boolean) => void;
  onClick: (task: Task) => void;
}

function InboxTaskRow({ task, isSelected, onSelect, onClick }: InboxTaskRowProps) {
  const hasRequiredFields = task.role_owner && task.due_date;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''
      }`}
      onClick={() => onClick(task)}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(task.id, checked as boolean)}
        />
      </div>

      {/* Ready indicator */}
      <div className="w-2 h-2 flex-shrink-0">
        {hasRequiredFields ? (
          <div className="w-2 h-2 rounded-full bg-green-500" title="可移动到看板" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-300" title="需要填写必填字段" />
        )}
      </div>

      {/* Task ID */}
      <span className="text-xs font-mono text-gray-400 w-20 flex-shrink-0">
        {task.id}
      </span>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-900 truncate block">{task.title}</span>
      </div>

      {/* Priority */}
      <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs flex-shrink-0`}>
        P{task.priority}
      </Badge>

      {/* Role Owner */}
      <div className="flex items-center gap-1 text-xs text-gray-500 w-24 flex-shrink-0">
        <Users className="w-3.5 h-3.5" />
        <span className="truncate">{task.role_owner || '未分配'}</span>
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500 w-24 flex-shrink-0">
        <Calendar className="w-3.5 h-3.5" />
        <span>{task.due_date || '未设置'}</span>
      </div>

      {/* Project */}
      {task.project && (
        <div className="flex items-center gap-1 text-xs text-gray-500 w-24 flex-shrink-0">
          <Folder className="w-3.5 h-3.5" />
          <span className="truncate">{task.project}</span>
        </div>
      )}

      {/* Capture time */}
      <span className="text-xs text-gray-400 w-16 flex-shrink-0 text-right">
        {new Date(task.capture_timestamp).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        })}
      </span>
    </div>
  );
}

export default memo(InboxTaskRow);
