import axios from 'axios';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';

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
}

export const login = async (username: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { username });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>('/roles');
  return response.data;
};
