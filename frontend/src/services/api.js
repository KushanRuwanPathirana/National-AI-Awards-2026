import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
export const buildAssetUrl = (filePath = '') => {
  const normalizedPath = String(filePath).replace(/\\/g, '/');
  const uploadIndex = normalizedPath.indexOf('/uploads/');
  const publicPath = uploadIndex >= 0
    ? normalizedPath.slice(uploadIndex + 1)
    : normalizedPath.replace(/^\/+/, '');

  return `${API_ORIGIN}/${publicPath}`;
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
