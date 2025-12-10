import { useState, memo } from 'react';
import { Plus, ExternalLink, Circle, CheckCircle2, Clock, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/task';
import { PRIORITY_COLORS } from '@/types/task';

interface SubtaskListProps {
  subtasks: Task[];
  onAddSubtask: (title: string) => void;
  onSubtaskClick: (task: Task) => void;
  readonly?: boolean;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  inbox: <Circle className="w-4 h-4 text-gray-400" />,
  next: <Play className="w-4 h-4 text-blue-500" />,
  waiting: <Clock className="w-4 h-4 text-yellow-500" />,
  done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
};

const STATUS_LABELS: Record<string, string> = {
  inbox: '待处理',
  next: '进行中',
  waiting: '等待中',
  done: '已完成',
};

function SubtaskList({
  subtasks,
  onAddSubtask,
  onSubtaskClick,
  readonly = false,
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAdd = () => {
    if (!newSubtaskTitle.trim() || readonly) return;
    onAddSubtask(newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const completedCount = subtasks.filter((st) => st.status === 'done').length;
  const totalCount = subtasks.length;

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          子任务
          {totalCount > 0 && (
            <span className="ml-2 text-gray-500">
              ({completedCount}/{totalCount})
            </span>
          )}
        </h4>
        {totalCount > 0 && (
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSubtaskClick(subtask)}
          >
            {/* Status icon */}
            {STATUS_ICONS[subtask.status]}

            {/* Task ID */}
            <span className="text-xs font-mono text-gray-400">{subtask.id}</span>

            {/* Title */}
            <span
              className={`flex-1 text-sm truncate ${
                subtask.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}
            >
              {subtask.title}
            </span>

            {/* Priority badge */}
            <Badge className={`${PRIORITY_COLORS[subtask.priority]} text-xs`}>
              {subtask.priority.toUpperCase()}
            </Badge>

            {/* Status label */}
            <span className="text-xs text-gray-400 w-16 text-right">
              {STATUS_LABELS[subtask.status]}
            </span>

            {/* Open in new panel indicator */}
            <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100" />
          </div>
        ))}
      </div>

      {/* Add new subtask input */}
      {!readonly && (
        <div className="flex items-center gap-2 pt-2">
          <Plus className="w-4 h-4 text-gray-400" />
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="添加子任务（将创建新任务并进入收件箱）..."
            className="flex-1 h-8 text-sm border-dashed"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            disabled={!newSubtaskTitle.trim()}
            className="h-8 px-3 text-sm"
          >
            添加
          </Button>
        </div>
      )}

      {/* Empty state */}
      {subtasks.length === 0 && (
        <p className="text-sm text-gray-400 italic py-2">
          {readonly ? '暂无子任务' : '添加子任务将创建新任务并自动进入收件箱'}
        </p>
      )}
    </div>
  );
}

export default memo(SubtaskList);
