import axios from 'axios';

// Get base URL from environment or fall back to default Render backend
const rawBaseUrl =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://quickai-t4a8.onrender.com';

// Ensure no trailing slash so path concatenation like `/api/ai/...` is always clean
export const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Create configured Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 60000, // 60s timeout for AI generation tasks
  headers: {
    Accept: 'application/json',
  },
});

// Response interceptor to handle any edge cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
