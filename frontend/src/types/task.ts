// Align with backend Status enum (7 statuses)
export type TaskStatus = 'inbox' | 'active' | 'next' | 'waiting' | 'done' | 'completed' | 'archived';

// Align with backend Priority enum (5 levels, numeric strings)
export type TaskPriority = '1' | '2' | '3' | '4' | '5';

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

// Priority color mapping (5 levels)
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  '1': 'bg-red-100 text-red-800',
  '2': 'bg-orange-100 text-orange-800',
  '3': 'bg-yellow-100 text-yellow-800',
  '4': 'bg-blue-100 text-blue-800',
  '5': 'bg-gray-100 text-gray-800',
};

// Helper function to get priority color
export function getPriorityColor(priority: TaskPriority): string {
  return PRIORITY_COLORS[priority];
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
