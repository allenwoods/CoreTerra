import axios from 'axios';

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
  const userId = import.meta.env.VITE_USER_ID;
  if (userId) {
    config.headers['X-User-ID'] = userId;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
