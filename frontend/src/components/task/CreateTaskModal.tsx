import { useState, useEffect, memo } from 'react';
import { Calendar, Users, Flag, Folder, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const [priority, setPriority] = useState<TaskPriority>('3');
  const [roleOwner, setRoleOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creator, setCreator] = useState('');
  const [project, setProject] = useState('');

  // Get parent task info if this is a subtask
  const parentTask = parentId ? getTaskById(parentId) : undefined;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setBody('');
      setPriority('3');
      setRoleOwner('');
      setDueDate('');
      setCreator('');
      // Inherit project from parent if creating subtask
      setProject(parentTask?.project || '');
    }
  }, [open, initialTitle, parentTask?.project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    // Create task with all metadata
    // Note: For now we use the simple createTask, but the full form data
    // would be passed to backend in production
    createTask(title.trim(), body, parentId);

    // Close modal and reset
    onOpenChange(false);
    setTitle('');
    setBody('');
    setPriority('p3');
    setRoleOwner('');
    setDueDate('');
    setCreator('');
    setProject('');
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
                  <SelectItem value="1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      P1 - 最高优先级
                    </span>
                  </SelectItem>
                  <SelectItem value="2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      P2 - 高优先级
                    </span>
                  </SelectItem>
                  <SelectItem value="3">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      P3 - 中等优先级
                    </span>
                  </SelectItem>
                  <SelectItem value="4">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      P4 - 低优先级
                    </span>
                  </SelectItem>
                  <SelectItem value="5">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-500" />
                      P5 - 最低优先级
                    </span>
                  </SelectItem>
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
