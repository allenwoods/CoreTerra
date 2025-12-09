import { useTaskContext } from '@/context/TaskContext';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TaskDetail from '@/components/task/TaskDetail';

export default function KanbanPage() {
  const { tasks, selectedTask, setSelectedTask } = useTaskContext();

  const handleTaskClick = (taskId: string) => {
    // Find task across all statuses
    const allTasks = [...tasks.inbox, ...tasks.next, ...tasks.waiting, ...tasks.done];
    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  return (
    <>
      <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskClick={handleTaskClick}
        />
      )}
    </>
  );
}
