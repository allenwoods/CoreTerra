import axios from 'axios';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';
import type { Task, TaskFilters, TaskHistoryItem } from '@/types/task';

/**
 * Axios instance configured for CoreTerra API.
 * Base URL is set from environment variable VITE_API_URL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding user_id header if available
api.interceptors.request.use((config) => {
  // Priority: localStorage > env var
  const userId = localStorage.getItem('user_id') || import.meta.env.VITE_USER_ID;
  if (userId) {
    config.headers['X-User-ID'] = userId;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, maybe clear storage? For now just log.
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

/**
 * Health check function for verification.
 * Call this to verify API connectivity.
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Auth & User API

export interface LoginResponse {
  user_id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
  color: string;
  level: number;
  experience: number;
}

export const login = async (username: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { username });
  return response.data;
};

// Backend user response interface
interface UserResponse {
  user_id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  color: string;
  level: number;
  experience: number;
}

export const getUsers = async (): Promise<User[]> => {
  // Backend returns UserResponse { user_id, ... }
  // We need to map it to User { id, ... }
  const response = await api.get<UserResponse[]>('/users');
  return response.data.map((u) => ({
    id: u.user_id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    color: u.color,
    level: u.level ?? 1,
    experience: u.experience ?? 0
  }));
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>('/roles');
  return response.data;
};

// Task API

/**
 * Fetch tasks with optional filters, sorting, and pagination.
 */
export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.tag) params.append('tag', filters.tag);
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);
  if (filters?.order) params.append('order', filters.order);
  if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());

  const queryString = params.toString();
  const url = queryString ? `/tasks/?${queryString}` : '/tasks/';

  const response = await api.get<Task[]>(url);
  return response.data;
};

/**
 * Fetch a single task by ID (includes full body).
 */
export const getTask = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Fetch Git commit history for a specific task.
 */
export const getTaskHistory = async (taskId: string, limit?: number): Promise<TaskHistoryItem[]> => {
  const params = limit ? { limit } : {};
  const response = await api.get<TaskHistoryItem[]>(`/tasks/${taskId}/history`, { params });
  return response.data;
};

/**
 * Create a new task.
 */
export interface CreateTaskRequest {
  title: string;
  user_id: string;
  priority?: string;
  tags?: string[];
  body?: string;
  role_owner?: string | null;
  type?: string;
  due_date?: string | null;
}

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  const response = await api.post<Task>('/tasks/', data);
  return response.data;
};

/**
 * Update task status.
 */
export interface UpdateTaskStatusRequest {
  status: string;
  user_id: string;
  updated_at: string;
}

export const updateTaskStatus = async (
  taskId: string,
  data: UpdateTaskStatusRequest
): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}/status`, data);
  return response.data;
};

/**
 * Update task metadata (PATCH).
 */
export interface UpdateTaskMetadataRequest {
  priority?: string;
  due_date?: string | null;
  tags?: string[];
  role_owner?: string | null;
  type?: string;
  title?: string;
  body?: string;  // NEW: Support body updates
  updated_at: string;  // Required for optimistic locking
}

export const updateTaskMetadata = async (
  taskId: string,
  data: UpdateTaskMetadataRequest
): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}`, data);
  return response.data;
};
