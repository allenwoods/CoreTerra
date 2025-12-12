// Import types and helpers from centralized config
import {
  type TaskPriority,
  type TaskStatus,
  PRIORITY_COLORS,
  getPriorityConfig
} from '@/config/enums';

// Re-export for backward compatibility
export type { TaskPriority, TaskStatus };
export { PRIORITY_COLORS };

export interface Assignee {
  initial: string;
  color: string;
  name: string;
}

export interface Task {
  id: string;  // Maps to backend task_id
  status: TaskStatus;
  title: string;
  priority: TaskPriority;
  user_id: string;  // Creator user ID
  role_owner: string | null;
  due_date: string | null;  // ISO 8601 datetime string
  capture_timestamp: string;  // ISO 8601 datetime string
  commitment_timestamp?: string;  // ISO 8601 datetime string
  completion_timestamp?: string;  // ISO 8601 datetime string
  updated_at: string;  // For optimistic locking
  project?: string;
  body: string;  // Markdown content
  parent_id?: string;  // If set, this task is a subtask
  tags?: string[];  // Task tags
  type?: string;  // Task type (Capture, NextAction, Project, etc.)

  // Legacy/UI helper fields (optional, can be computed)
  creator?: string | null;
  reviewer?: string | null;
  collaborator?: string | null;
  assignee?: Assignee;
}

// Helper type for tasks grouped by status
export type TasksByStatus = Record<TaskStatus, Task[]>;

// Helper function to get priority color (uses config)
export function getPriorityColor(priority: TaskPriority): string {
  return getPriorityConfig(priority)?.tailwind_class || PRIORITY_COLORS[priority];
}

// API Query Filters
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Task History Item
export interface TaskHistoryItem {
  commit_hash: string;
  author_name: string;
  author_email: string;
  timestamp: string;
  message: string;
}
