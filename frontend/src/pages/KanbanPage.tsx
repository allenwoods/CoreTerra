import { useTaskContext } from '@/context/TaskContext';
import { useUserContext } from '@/context/UserContext';

export default function KanbanPage() {
  const { tasks } = useTaskContext();
  const { currentUser } = useUserContext();

  const totalTasks = Object.values(tasks).reduce((sum, taskList) => sum + taskList.length, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your tasks across Next, Waiting, and Done columns</p>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50/30">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Kanban View Coming Soon</h2>
          <p className="text-gray-500 mb-4">Phase 4: KanbanBoard, KanbanColumn, TaskCard</p>

          {/* Context Data Verification */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">✅ Context Data Loaded</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current User:</span>
                <span className="font-medium text-gray-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tasks:</span>
                <span className="font-medium text-gray-900">{totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inbox:</span>
                <span className="font-medium text-gray-900">{tasks.inbox.length} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next:</span>
                <span className="font-medium text-gray-900">{tasks.next.length} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waiting:</span>
                <span className="font-medium text-gray-900">{tasks.waiting.length} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Done:</span>
                <span className="font-medium text-gray-900">{tasks.done.length} tasks</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            State management working! Try adding a task with QuickAddBar.
          </div>
        </div>
      </div>
    </div>
  );
}
