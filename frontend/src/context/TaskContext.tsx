import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Task, TasksByStatus, TaskStatus, TaskPriority } from '@/types/task';
import { initialLogs } from '@/lib/mockData';
import { getTasks, createTask as apiCreateTask, updateTaskStatus as apiUpdateTaskStatus, updateTaskMetadata as apiUpdateTaskMetadata, getTask } from '@/lib/api';
import { DEFAULT_PRIORITY, DEFAULT_TASK_TYPE } from '@/config/enums';
import type { UpdateTaskMetadataRequest } from '@/lib/api';

export interface CreateTaskData {
  title: string;
  body?: string;
  parentId?: string;
  priority?: TaskPriority;
  role_owner?: string | null;
  due_date?: string | null;
  tags?: string[];
  type?: string;
}

interface TaskContextType {
  // State
  tasks: TasksByStatus;
  selectedTask: Task | null;
  filterText: string;
  activityLog: string[];
  isLoading: boolean;
  error: string | null;

  // Task operations
  setSelectedTask: (task: Task | null) => void;
  updateTask: (task: Task, logMessage: string) => void;
  createTask: (data: CreateTaskData) => void;
  deleteTask: (taskId: string) => void;
  setFilterText: (text: string) => void;
  refetch: () => Promise<void>;

  // Subtask queries
  getSubtasks: (parentId: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<TasksByStatus>({
    inbox: [],
    active: [],
    next: [],
    waiting: [],
    done: [],
    completed: [],
    archived: [],
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterText, setFilterText] = useState('');
  const [activityLog, setActivityLog] = useState<string[]>(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tasksData = await getTasks();
      // Group by status
      const grouped: TasksByStatus = {
        inbox: [],
        active: [],
        next: [],
        waiting: [],
        done: [],
        completed: [],
        archived: [],
      };

      tasksData.forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });

      setTasks(grouped);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (updatedTask: Task, logMessage: string) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User not logged in');
      }

      // Determine if this is a status change or metadata change
      const isStatusChange = updatedTask.status !== selectedTask?.status;

      let savedTask: Task;

      if (isStatusChange) {
        // Use PUT /tasks/{id}/status
        savedTask = await apiUpdateTaskStatus(updatedTask.id, {
          status: updatedTask.status,
          user_id: userId,
          updated_at: updatedTask.updated_at,
        });
      } else {
        // Use PATCH /tasks/{id} for metadata/body changes
        const patchData: UpdateTaskMetadataRequest = {
          updated_at: updatedTask.updated_at,
        };

        // Only include changed fields
        if (selectedTask) {
          if (updatedTask.title !== selectedTask.title) patchData.title = updatedTask.title;
          if (updatedTask.body !== selectedTask.body) patchData.body = updatedTask.body;
          if (updatedTask.priority !== selectedTask.priority) patchData.priority = updatedTask.priority;
          if (updatedTask.role_owner !== selectedTask.role_owner) patchData.role_owner = updatedTask.role_owner;
          if (updatedTask.due_date !== selectedTask.due_date) patchData.due_date = updatedTask.due_date;
          if (JSON.stringify(updatedTask.tags) !== JSON.stringify(selectedTask.tags)) patchData.tags = updatedTask.tags;
          if (updatedTask.type !== selectedTask.type) patchData.type = updatedTask.type;
        }

        savedTask = await apiUpdateTaskMetadata(updatedTask.id, patchData);
      }

      // Update local state with response from backend
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      setActivityLog((prev) => [`[${timestamp}] ${logMessage}`, ...prev]);

      setTasks((prev) => {
        const newTasks = { ...prev };

        // Remove from old status
        for (const status of Object.keys(newTasks) as TaskStatus[]) {
          const idx = newTasks[status].findIndex((t) => t.id === savedTask.id);
          if (idx !== -1) {
            newTasks[status] = [...newTasks[status]];
            newTasks[status].splice(idx, 1);
            break;
          }
        }

        // Add to new status
        const targetStatus = savedTask.status || 'inbox';
        if (!newTasks[targetStatus]) {
          newTasks[targetStatus] = [];
        }
        newTasks[targetStatus] = [savedTask, ...newTasks[targetStatus]];

        return newTasks;
      });

      // Update selected task with saved version (includes new updated_at)
      setSelectedTask(savedTask);

    } catch (err: unknown) {
      // Handle optimistic locking conflicts
      const error = err as { response?: { status: number }; message?: string };
      if (error.response?.status === 409) {
        setError('Task has been modified by another user. Refreshing...');

        // Fetch latest version
        await fetchTasks();

        // Reload the task detail if still selected
        if (selectedTask?.id === updatedTask.id) {
          const latest = await getTask(updatedTask.id);
          setSelectedTask(latest);
        }

        alert('Task was modified by another user. Your changes were not saved. Please review and try again.');
      } else {
        setError(error.message || 'Failed to update task');
        console.error('Error updating task:', error);
        alert(`Failed to update task: ${error.message || 'Unknown error'}`);
      }
    }
  }, [selectedTask, fetchTasks]);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task (optionally as a subtask if parentId is provided)
  const createTask = useCallback(async (data: CreateTaskData) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const newTask = await apiCreateTask({
        title: data.title,
        user_id: userId,
        priority: data.priority || DEFAULT_PRIORITY,
        body: data.body || '',
        type: data.type || DEFAULT_TASK_TYPE,
        role_owner: data.role_owner || null,
        tags: data.tags || undefined,
        due_date: data.due_date || null,
      });

      // If parentId, we'd need to update the parent_id field via PATCH
      // For now, just add to inbox
      setTasks((prev) => ({
        ...prev,
        inbox: [newTask, ...prev.inbox],
      }));

      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

      const parentInfo = data.parentId ? ` (subtask of #${data.parentId})` : '';
      setActivityLog((prev) => [`[${timestamp}] Created Task #${newTask.id}: '${data.title}'${parentInfo}`, ...prev]);
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');

    }
  }, []);

  // Delete a task
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const newTasks = { ...prev };

      for (const status of Object.keys(newTasks) as TaskStatus[]) {
        const idx = newTasks[status].findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          newTasks[status] = [...newTasks[status]];
          newTasks[status].splice(idx, 1);
          break;
        }
      }

      return newTasks;
    });

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setActivityLog((prev) => [`[${timestamp}] Deleted Task #${taskId}`, ...prev]);

    // Clear selected task if it's the one being deleted
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  }, [selectedTask]);

  // Get all subtasks for a given parent task
  const getSubtasks = useCallback(
    (parentId: string): Task[] => {
      const allTasks = [
        ...tasks.inbox,
        ...tasks.next,
        ...tasks.waiting,
        ...tasks.done,
      ];
      return allTasks.filter((t) => t.parent_id === parentId);
    },
    [tasks]
  );

  // Get a task by ID
  const getTaskById = useCallback(
    (taskId: string): Task | undefined => {
      const allTasks = [
        ...tasks.inbox,
        ...tasks.next,
        ...tasks.waiting,
        ...tasks.done,
      ];
      return allTasks.find((t) => t.id === taskId);
    },
    [tasks]
  );

  const value: TaskContextType = {
    tasks,
    selectedTask,
    filterText,
    activityLog,
    isLoading,
    error,
    setSelectedTask,
    updateTask,
    createTask,
    deleteTask,
    setFilterText,
    refetch: fetchTasks,
    getSubtasks,
    getTaskById,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// Hook to use TaskContext
// eslint-disable-next-line react-refresh/only-export-components
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
