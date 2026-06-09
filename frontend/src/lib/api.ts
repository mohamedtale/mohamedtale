import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/ar/login';
        }
      } else {
        window.location.href = '/ar/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Wells
export const wellsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/wells', { params }),
  getById: (id: string) => api.get(`/wells/${id}`),
  getStats: () => api.get('/wells/stats'),
  create: (data: Record<string, unknown>) => api.post('/wells', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/wells/${id}`, data),
  delete: (id: string) => api.delete(`/wells/${id}`),
  getMaintenance: (id: string) => api.get(`/wells/${id}/maintenance`),
  addMaintenance: (id: string, data: Record<string, unknown>) =>
    api.post(`/wells/${id}/maintenance`, data),
};

// Reports
export const reportsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/reports', { params }),
  getById: (id: string) => api.get(`/reports/${id}`),
  create: (data: Record<string, unknown>) => api.post('/reports', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/reports/${id}`, data),
  submit: (id: string) => api.post(`/reports/${id}/submit`),
  approve: (id: string) => api.post(`/reports/${id}/approve`),
  delete: (id: string) => api.delete(`/reports/${id}`),
};

// Users
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Workflows
export const workflowsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/workflows', { params }),
  getById: (id: string) => api.get(`/workflows/${id}`),
  create: (data: Record<string, unknown>) => api.post('/workflows', data),
  action: (id: string, action: string, comment?: string) =>
    api.post(`/workflows/${id}/action`, { action, comment }),
};

// Import
export const importApi = {
  importWells: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/wells', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for large files
    });
  },
};

// Logs
export const logsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/logs', { params }),
};

export default api;
