export type TaskStatus = 'inbox' | 'next' | 'waiting' | 'done';
export type TaskPriority = 'p1' | 'p2' | 'p3';

export interface Assignee {
  initial: string;
  color: string;
  name: string;
}

export interface Task {
  id: string;
  status: TaskStatus;
  title: string;
  priority: TaskPriority;
  priorityColor: string; // Computed from priority: e.g., 'bg-red-100 text-red-800'
  role_owner: string;
  creator: string | null;
  reviewer: string | null;
  collaborator: string | null;
  due_date: string; // ISO 8601 date string: YYYY-MM-DD
  timestamp_capture: string; // ISO 8601 datetime string
  timestamp_commitment?: string; // ISO 8601 datetime string
  timestamp_completion?: string; // ISO 8601 datetime string
  project?: string;
  body: string; // Markdown content
  assignee?: Assignee;
}

export interface Subtask {
  checked: boolean;
  title: string;
  link: string;
}

// Helper type for tasks grouped by status
export type TasksByStatus = Record<TaskStatus, Task[]>;

// Priority color mapping
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  p1: 'bg-red-100 text-red-800',
  p2: 'bg-yellow-100 text-yellow-800',
  p3: 'bg-purple-100 text-purple-800',
};

// Helper function to get priority color
export function getPriorityColor(priority: TaskPriority): string {
  return PRIORITY_COLORS[priority];
}
