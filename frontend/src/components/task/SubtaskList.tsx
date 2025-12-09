import { useState, memo } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  link?: string;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  readonly?: boolean;
}

function SubtaskList({ subtasks, onChange, readonly = false }: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const generateId = () => `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleToggle = (id: string) => {
    if (readonly) return;
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    onChange(updated);
  };

  const handleAdd = () => {
    if (!newSubtaskTitle.trim() || readonly) return;
    const newSubtask: Subtask = {
      id: generateId(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleDelete = (id: string) => {
    if (readonly) return;
    onChange(subtasks.filter((st) => st.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const startEditing = (subtask: Subtask) => {
    if (readonly) return;
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    const updated = subtasks.map((st) =>
      st.id === editingId ? { ...st, title: editTitle.trim() } : st
    );
    onChange(updated);
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
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
            className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {!readonly && (
              <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab" />
            )}
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => handleToggle(subtask.id)}
              disabled={readonly}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            {editingId === subtask.id ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleEditKeyDown}
                className="flex-1 h-7 text-sm"
                autoFocus
              />
            ) : (
              <span
                className={`flex-1 text-sm cursor-pointer ${
                  subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}
                onClick={() => startEditing(subtask)}
              >
                {subtask.title}
              </span>
            )}
            {subtask.link && (
              <a
                href={subtask.link}
                className="text-xs text-blue-500 hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                链接
              </a>
            )}
            {!readonly && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                onClick={() => handleDelete(subtask.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
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
            placeholder="添加子任务..."
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
      {subtasks.length === 0 && readonly && (
        <p className="text-sm text-gray-400 italic">暂无子任务</p>
      )}
    </div>
  );
}

export default memo(SubtaskList);
