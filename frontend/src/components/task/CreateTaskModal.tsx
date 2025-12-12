import { useState, useEffect, memo } from 'react';
import { Calendar, Users, Flag, Folder, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserContext } from '@/context/UserContext';
import { useTaskContext } from '@/context/TaskContext';
import type { TaskPriority } from '@/types/task';
import { PRIORITIES, DEFAULT_PRIORITY } from '@/config/enums';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle?: string;
  parentId?: string;
}

function CreateTaskModal({ open, onOpenChange, initialTitle = '', parentId }: CreateTaskModalProps) {
  const { roles, users } = useUserContext();
  const { createTask, getTaskById } = useTaskContext();

  // Form state
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY as TaskPriority);
  const [roleOwner, setRoleOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creator, setCreator] = useState('');
  const [project, setProject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Get parent task info if this is a subtask
  const parentTask = parentId ? getTaskById(parentId) : undefined;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setBody('');
      setPriority(DEFAULT_PRIORITY as TaskPriority);
      setRoleOwner('');
      setDueDate('');
      setCreator('');
      // Inherit project from parent if creating subtask
      setProject(parentTask?.project || '');
      setTags([]);
      setTagInput('');
    }
  }, [open, initialTitle, parentTask?.project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    // Create task with all metadata
    createTask({
      title: title.trim(),
      body,
      parentId,
      priority,
      role_owner: roleOwner || null,
      due_date: dueDate || null,
      tags: tags.length > 0 ? tags : undefined,
    });

    // Close modal and reset
    onOpenChange(false);
    setTitle('');
    setBody('');
    setPriority(DEFAULT_PRIORITY as TaskPriority);
    setRoleOwner('');
    setDueDate('');
    setCreator('');
    setProject('');
    setTags([]);
    setTagInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {parentId ? '创建子任务' : '创建新任务'}
          </DialogTitle>
        </DialogHeader>

        {/* Parent task info */}
        {parentTask && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-600">
              父任务: <span className="font-mono">{parentTask.id}</span> - {parentTask.title}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Title - Required */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="任务标题..."
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Two column grid for metadata */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                优先级
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.icon_color}`} />
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Owner */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                负责角色
              </Label>
              <Select value={roleOwner || '_none'} onValueChange={(v) => setRoleOwner(v === '_none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">稍后分配</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                截止日期
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                项目
              </Label>
              <Input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="项目名称"
              />
            </div>

            {/* Creator */}
            <div className="space-y-2 col-span-2">
              <Label className="flex items-center gap-1">
                <User className="w-4 h-4" />
                创建者
              </Label>
              <Select value={creator || '_none'} onValueChange={(v) => setCreator(v === '_none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择用户" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">未指定</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="tags">标签</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                placeholder="输入标签后按Enter添加..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = tagInput.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                      setTagInput('');
                    }
                  }
                }}
              />
              <p className="text-xs text-gray-400">提示: 支持多标签,按Enter添加</p>
            </div>
          </div>

          {/* Body / Description */}
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="任务描述（支持 Markdown）..."
              className="min-h-[120px] font-mono text-sm"
            />
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-500">
            任务将创建并进入收件箱。填写负责角色和截止日期后可移动到看板。
            <br />
            <span className="text-gray-400">提示: 按 Cmd/Ctrl + Enter 快速提交</span>
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              创建任务
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(CreateTaskModal);
