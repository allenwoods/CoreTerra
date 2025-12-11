import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, TasksByStatus, TaskStatus } from '@/types/task';
import { initialLogs } from '@/lib/mockData';
import { getPriorityColor } from '@/types/task';
import { getTasks, createTask as apiCreateTask, updateTaskMetadata } from '@/lib/api';

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
  createTask: (title: string, body?: string, parentId?: string) => void;
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

  // Update an existing task
  const updateTask = useCallback((updatedTask: Task, logMessage: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setActivityLog((prev) => [`[${timestamp}] ${logMessage}`, ...prev]);

    setTasks((prev) => {
      const newTasks = { ...prev };

      // Find and remove the task from its current status
      for (const status of Object.keys(newTasks) as TaskStatus[]) {
        const idx = newTasks[status].findIndex((t) => t.id === updatedTask.id);
        if (idx !== -1) {
          newTasks[status] = [...newTasks[status]];
          newTasks[status].splice(idx, 1);
          break;
        }
      }

      // Add the task to its new status
      const targetStatus = updatedTask.status || 'inbox';
      if (!newTasks[targetStatus]) {
        newTasks[targetStatus] = [];
      }
      newTasks[targetStatus] = [updatedTask, ...newTasks[targetStatus]];

      return newTasks;
    });

    // Update selected task if it's the one being updated
    setSelectedTask(updatedTask);
  }, []);

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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task (optionally as a subtask if parentId is provided)
  const createTask = useCallback(async (title: string, body: string = '', parentId?: string) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const newTask = await apiCreateTask({
        title,
        user_id: userId,
        priority: '3',
        body,
        type: 'Capture',
      });

      // If parentId, we'd need to update the parent_id field via PATCH
      // For now, just add to inbox
      setTasks((prev) => ({
        ...prev,
        inbox: [newTask, ...prev.inbox],
      }));

      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const parentInfo = parentId ? ` (subtask of #${parentId})` : '';
      setActivityLog((prev) => [`[${timestamp}] Created Task #${newTask.id}: '${title}'${parentInfo}`, ...prev]);
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
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
