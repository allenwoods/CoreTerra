import { useCallback } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import InboxList from '@/components/inbox/InboxList';
import TaskDetail from '@/components/task/TaskDetail';
import type { Task } from '@/types/task';

export default function InboxPage() {
  const { tasks, selectedTask, setSelectedTask, isLoading, error } = useTaskContext();
  const { moveToBoard, deleteTask } = useTaskOperations();

  const inboxTasks = tasks.inbox;

  const handleTaskClick = useCallback(
    (task: Task) => {
      setSelectedTask(task);
    },
    [setSelectedTask]
  );

  const handleMoveToBoard = useCallback(
    (taskIds: string[]) => {
      taskIds.forEach((taskId) => {
        const task = inboxTasks.find((t) => t.id === taskId);
        if (task && task.role_owner && task.due_date) {
          moveToBoard(task);
        }
      });
    },
    [inboxTasks, moveToBoard]
  );

  const handleDelete = useCallback(
    (taskIds: string[]) => {
      taskIds.forEach((taskId) => {
        deleteTask(taskId);
      });
    },
    [deleteTask]
  );

  const handleTaskClickFromDetail = useCallback(
    (taskId: string) => {
      const allTasks = [...tasks.inbox, ...tasks.next, ...tasks.waiting, ...tasks.done];
      const task = allTasks.find((t) => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    },
    [tasks, setSelectedTask]
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">收件箱</h1>
        <p className="text-gray-500 text-sm mt-1">
          审阅和处理新任务。填写必填字段后将任务移动到看板。
        </p>
      </div>

      {/* Content */}
      <InboxList
        tasks={inboxTasks}
        onTaskClick={handleTaskClick}
        onMoveToBoard={handleMoveToBoard}
        onDelete={handleDelete}
        isLoading={isLoading}
        error={error}
      />

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskClick={handleTaskClickFromDetail}
        />
      )}
    </div>
  );
}
