import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Task, TasksByStatus, TaskStatus } from '@/types/task';
import { initialTasks, initialLogs } from '@/lib/mockData';
import { getPriorityColor } from '@/types/task';

interface TaskContextType {
  // State
  tasks: TasksByStatus;
  selectedTask: Task | null;
  filterText: string;
  activityLog: string[];

  // Task operations
  setSelectedTask: (task: Task | null) => void;
  updateTask: (task: Task, logMessage: string) => void;
  createTask: (title: string, body?: string) => void;
  deleteTask: (taskId: string) => void;
  setFilterText: (text: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<TasksByStatus>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterText, setFilterText] = useState('');
  const [activityLog, setActivityLog] = useState<string[]>(initialLogs);

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

  // Create a new task
  const createTask = useCallback((title: string, body: string = '') => {
    const id = 'CT-' + Math.floor(100 + Math.random() * 900);

    const newTask: Task = {
      id,
      status: 'inbox',
      title,
      priority: 'p3',
      priorityColor: getPriorityColor('p3'),
      role_owner: '',
      creator: null,
      reviewer: null,
      collaborator: null,
      due_date: '',
      timestamp_capture: new Date().toISOString(),
      body,
      assignee: { initial: '?', color: 'bg-gray-400', name: 'Unassigned' },
    };

    setTasks((prev) => ({
      ...prev,
      inbox: [newTask, ...prev.inbox],
    }));

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setActivityLog((prev) => [`[${timestamp}] Created Task #${id}: '${title}'`, ...prev]);
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

  const value: TaskContextType = {
    tasks,
    selectedTask,
    filterText,
    activityLog,
    setSelectedTask,
    updateTask,
    createTask,
    deleteTask,
    setFilterText,
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
