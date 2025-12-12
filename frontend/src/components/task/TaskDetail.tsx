import { useState, useEffect, memo } from 'react';
import { X, Calendar, User, Users, Flag, Folder, Clock, CheckCircle2, ArrowRight, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUserContext } from '@/context/UserContext';
import { useTaskContext } from '@/context/TaskContext';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import MarkdownRenderer from './MarkdownRenderer';
import SubtaskList from './SubtaskList';
import { TaskHistory } from './TaskHistory';
import type { Task, TaskStatus, TaskPriority } from '@/types/task';
import { PRIORITY_COLORS } from '@/types/task';
import { PRIORITIES } from '@/config/enums';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onTaskClick?: (taskId: string) => void;
}

function TaskDetail({ task, onClose, onTaskClick }: TaskDetailProps) {
  const { roles, users } = useUserContext();
  const { getSubtasks, createTask, getTaskById } = useTaskContext();
  const { updateTask, moveToBoard, changeStatus } = useTaskOperations();

  // Local state for editing
  const [title, setTitle] = useState(task.title);
  const [body, setBody] = useState(task.body);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [roleOwner, setRoleOwner] = useState(task.role_owner || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [creator, setCreator] = useState(task.creator || '');
  const [reviewer, setReviewer] = useState(task.reviewer || '');
  const [collaborator, setCollaborator] = useState(task.collaborator || '');
  const [project, setProject] = useState(task.project || '');
  const [isEditing, setIsEditing] = useState(false);

  // Get subtasks for current task
  const subtasks = getSubtasks(task.id);

  // Get parent task if this is a subtask
  const parentTask = task.parent_id ? getTaskById(task.parent_id) : undefined;

  // Update local state when task changes
  // Multiple setState calls are intentional to sync prop changes to local state
  useEffect(() => {
    setTitle(task.title);
    setBody(task.body);
    setPriority(task.priority);
    setRoleOwner(task.role_owner || '');
    setDueDate(task.due_date || '');
    setCreator(task.creator || '');
    setReviewer(task.reviewer || '');
    setCollaborator(task.collaborator || '');
    setProject(task.project || '');
    setIsEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  // Save changes
  const handleSave = async () => {
    const updatedTask: Task = {
      ...task,
      title,
      body,
      priority,
      role_owner: roleOwner || null,
      due_date: dueDate || null,
      creator: creator || null,
      reviewer: reviewer || null,
      collaborator: collaborator || null,
      project: project || undefined,
      updated_at: task.updated_at,  // CRITICAL: For optimistic locking
    };

    await updateTask(updatedTask, `UPDATE: ${task.id} - ${task.title}`);
    setIsEditing(false);
  };

  // Handle move to board
  const handleMoveToBoard = () => {
    if (!roleOwner || !dueDate) {
      alert('请先填写负责角色和截止日期');
      return;
    }

    // Build task with all current edits
    const taskToMove: Task = {
      ...task,
      title,
      body,
      priority,
      role_owner: roleOwner,
      due_date: dueDate,
      creator: creator || null,
      reviewer: reviewer || null,
      collaborator: collaborator || null,
      project: project || undefined,
      updated_at: task.updated_at,  // Pass current timestamp for optimistic locking
    };

    try {
      moveToBoard(taskToMove);
      setIsEditing(false);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: TaskStatus) => {
    changeStatus(task, newStatus);
  };

  // Handle adding a new subtask (creates a new task with parent_id)
  const handleAddSubtask = (subtaskTitle: string) => {
    createTask({ title: subtaskTitle, body: '', parentId: task.id });
  };

  // Handle clicking on a subtask (navigate to it)
  const handleSubtaskClick = (subtask: Task) => {
    if (onTaskClick) {
      onTaskClick(subtask.id);
    }
  };

  // Handle clicking on parent task link
  const handleParentClick = () => {
    if (parentTask && onTaskClick) {
      onTaskClick(parentTask.id);
    }
  };

  const isInbox = task.status === 'inbox';
  const canMoveToBoard = roleOwner && dueDate;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Panel - full screen on mobile, slide panel on desktop */}
      <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[500px] bg-white shadow-xl sm:border-l border-gray-200 flex flex-col z-50 animate-in fade-in sm:slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs">
            {task.id}
          </Badge>
          <Badge className={PRIORITY_COLORS[task.priority]}>
            {task.priority.toUpperCase()}
          </Badge>
          <Badge
            variant="outline"
            className={
              task.status === 'done'
                ? 'bg-green-100 text-green-800 border-green-200'
                : task.status === 'inbox'
                ? 'bg-gray-100 text-gray-600 border-gray-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }
          >
            {task.status}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Parent task link (if this is a subtask) */}
      {parentTask && (
        <div
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={handleParentClick}
        >
          <Link2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600">
            父任务: <span className="font-mono">{parentTask.id}</span> - {parentTask.title}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
              placeholder="任务标题"
            />
          ) : (
            <h2
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded"
              onClick={() => setIsEditing(true)}
            >
              {title}
            </h2>
          )}
        </div>

        <Separator />

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Role Owner */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              负责角色 {isInbox && <span className="text-red-500">*</span>}
            </Label>
            <Select value={roleOwner} onValueChange={setRoleOwner}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" />
              优先级
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger className="h-9">
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

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              截止日期 {isInbox && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" />
              项目
            </Label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="项目名称"
              className="h-9"
            />
          </div>

          {/* Creator */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              创建者
            </Label>
            <Select
              value={creator || '_none'}
              onValueChange={(v) => setCreator(v === '_none' ? '' : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="选择用户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">无</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reviewer */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              审核者
            </Label>
            <Select
              value={reviewer || '_none'}
              onValueChange={(v) => setReviewer(v === '_none' ? '' : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="选择用户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">无</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            时间戳
          </Label>
          <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span>捕获时间:</span>
              <span className="font-mono">{new Date(task.capture_timestamp).toLocaleString()}</span>
            </div>
            {task.commitment_timestamp && (
              <div className="flex justify-between">
                <span>承诺时间:</span>
                <span className="font-mono">
                  {new Date(task.commitment_timestamp).toLocaleString()}
                </span>
              </div>
            )}
            {task.completion_timestamp && (
              <div className="flex justify-between">
                <span>完成时间:</span>
                <span className="font-mono">
                  {new Date(task.completion_timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <TaskHistory taskId={task.id} />

        <Separator />

        {/* Subtasks - now using real Task data */}
        <SubtaskList
          subtasks={subtasks}
          onAddSubtask={handleAddSubtask}
          onSubtaskClick={handleSubtaskClick}
          readonly={task.status === 'done'}
        />

        <Separator />

        {/* Body / Description */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">描述</Label>
          {isEditing ? (
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="任务描述（支持 Markdown）..."
              className="min-h-[150px] font-mono text-sm"
            />
          ) : (
            <div
              className="min-h-[100px] p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {body ? (
                <MarkdownRenderer
                  content={body}
                  onTaskClick={onTaskClick}
                />
              ) : (
                <p className="text-sm text-gray-400 italic">点击添加描述...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        {/* Status Actions for non-inbox tasks */}
        {!isInbox && task.status !== 'done' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('waiting')}
              disabled={task.status === 'waiting'}
            >
              等待中
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('next')}
              disabled={task.status === 'next'}
            >
              下一步
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusChange('done')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              完成
            </Button>
          </div>
        )}

        {/* Move to Board for inbox tasks */}
        {isInbox && (
          <Button
            className="w-full"
            onClick={handleMoveToBoard}
            disabled={!canMoveToBoard}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            移动到看板
          </Button>
        )}

        {/* Save/Cancel buttons when editing */}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              保存更改
            </Button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default memo(TaskDetail);
