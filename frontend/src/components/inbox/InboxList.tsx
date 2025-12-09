import { useState, useMemo, memo } from 'react';
import { Search, ArrowUpDown, ArrowRight, Trash2, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InboxTaskRow from './InboxTaskRow';
import type { Task, TaskPriority } from '@/types/task';

type SortField = 'timestamp_capture' | 'priority' | 'due_date' | 'title';
type SortOrder = 'asc' | 'desc';

interface InboxListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onMoveToBoard: (taskIds: string[]) => void;
  onDelete: (taskIds: string[]) => void;
}

const priorityOrder: Record<TaskPriority, number> = { p1: 1, p2: 2, p3: 3 };

function InboxList({ tasks, onTaskClick, onMoveToBoard, onDelete }: InboxListProps) {
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp_capture');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter tasks by search text
  const filteredTasks = useMemo(() => {
    if (!searchText.trim()) return tasks;
    const search = searchText.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.id.toLowerCase().includes(search) ||
        task.project?.toLowerCase().includes(search)
    );
  }, [tasks, searchText]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'timestamp_capture':
          comparison = new Date(a.timestamp_capture).getTime() - new Date(b.timestamp_capture).getTime();
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'due_date':
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'zh-CN');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sortField, sortOrder]);

  // Selection handlers
  const handleSelect = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTasks.map((t) => t.id)));
    }
  };

  // Bulk actions
  const handleBulkMoveToBoard = () => {
    const selectedTasks = tasks.filter((t) => selectedIds.has(t.id));
    const readyTasks = selectedTasks.filter((t) => t.role_owner && t.due_date);

    if (readyTasks.length === 0) {
      alert('所选任务需要先填写负责角色和截止日期');
      return;
    }

    if (readyTasks.length < selectedTasks.length) {
      const proceed = confirm(
        `${selectedTasks.length} 个任务中只有 ${readyTasks.length} 个可以移动。继续移动这些任务吗？`
      );
      if (!proceed) return;
    }

    onMoveToBoard(readyTasks.map((t) => t.id));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 个任务吗？`)) {
      onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const allSelected = sortedTasks.length > 0 && selectedIds.size === sortedTasks.length;
  const someSelected = selectedIds.size > 0;
  const readyCount = tasks.filter((t) => t.role_owner && t.due_date).length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索任务..."
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp_capture">捕获时间</SelectItem>
              <SelectItem value="priority">优先级</SelectItem>
              <SelectItem value="due_date">截止日期</SelectItem>
              <SelectItem value="title">标题</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={toggleSortOrder}>
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'asc' ? '升序' : '降序'}
          </Button>
        </div>

        {/* Bulk actions */}
        {someSelected && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">已选 {selectedIds.size} 项</span>
            <Button variant="outline" size="sm" onClick={handleBulkMoveToBoard}>
              <ArrowRight className="w-4 h-4 mr-1" />
              移动到看板
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-1" />
              删除
            </Button>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-6 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
        <span>共 {tasks.length} 个待处理任务</span>
        <span className="text-green-600">{readyCount} 个可移动</span>
        <span className="text-gray-400">{tasks.length - readyCount} 个需补充信息</span>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
        <div className="w-5">
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleSelectAll}>
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="w-2" />
        <div className="w-20">ID</div>
        <div className="flex-1">标题</div>
        <div className="w-12">优先级</div>
        <div className="w-24">负责角色</div>
        <div className="w-24">截止日期</div>
        <div className="w-24">项目</div>
        <div className="w-16 text-right">捕获</div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            {searchText ? (
              <>
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p>未找到匹配的任务</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckSquare className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-600">收件箱已清空！</p>
                <p className="text-sm">使用底部快捷栏添加新任务</p>
              </>
            )}
          </div>
        ) : (
          sortedTasks.map((task) => (
            <InboxTaskRow
              key={task.id}
              task={task}
              isSelected={selectedIds.has(task.id)}
              onSelect={handleSelect}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default memo(InboxList);
