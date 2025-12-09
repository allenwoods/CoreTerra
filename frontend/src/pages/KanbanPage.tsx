import { useTaskContext } from '@/context/TaskContext';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function KanbanPage() {
  const { tasks, setSelectedTask } = useTaskContext();

  return <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />;
}
