import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FilterSettings() {
  const [defaultView, setDefaultView] = useState('board');
  const [defaultStatus, setDefaultStatus] = useState('all');
  const [defaultSort, setDefaultSort] = useState('priority');

  const handleChange = (key: string, value: string) => {
    switch (key) {
      case 'view':
        setDefaultView(value);
        break;
      case 'status':
        setDefaultStatus(value);
        break;
      case 'sort':
        setDefaultSort(value);
        break;
    }
    // Mock: In real app, this would save to backend
    console.log(`Filter setting ${key} changed to:`, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">过滤器设置</h3>
        <p className="text-sm text-gray-500 mt-1">
          配置看板的默认显示偏好
        </p>
      </div>

      <div className="space-y-6">
        {/* Default View */}
        <div className="space-y-2">
          <Label htmlFor="defaultView">默认视图</Label>
          <Select value={defaultView} onValueChange={(v) => handleChange('view', v)}>
            <SelectTrigger id="defaultView" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="board">看板视图</SelectItem>
              <SelectItem value="calendar">日历视图</SelectItem>
              <SelectItem value="list">列表视图</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">进入 Kanban 页面时默认显示的视图</p>
        </div>

        {/* Default Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="defaultStatus">默认状态筛选</Label>
          <Select value={defaultStatus} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger id="defaultStatus" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">仅进行中</SelectItem>
              <SelectItem value="next">仅待处理</SelectItem>
              <SelectItem value="done">仅已完成</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">看板默认显示的任务状态范围</p>
        </div>

        {/* Default Sort */}
        <div className="space-y-2">
          <Label htmlFor="defaultSort">默认排序方式</Label>
          <Select value={defaultSort} onValueChange={(v) => handleChange('sort', v)}>
            <SelectTrigger id="defaultSort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">按优先级</SelectItem>
              <SelectItem value="dueDate">按截止日期</SelectItem>
              <SelectItem value="created">按创建时间</SelectItem>
              <SelectItem value="updated">按更新时间</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">任务列表的默认排序规则</p>
        </div>
      </div>
    </div>
  );
}
