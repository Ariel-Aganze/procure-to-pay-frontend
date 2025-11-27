import axios from 'axios';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  register: (userData) => api.post('/api/auth/register/', userData),
  logout: (refreshToken) => api.post('/api/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  getDashboardStats: () => api.get('/api/auth/dashboard-stats/'),
  getUsers: (params) => api.get('/api/auth/users/', { params }),
  createUser: (userData) => api.post('/api/auth/users/', userData),
  updateUser: (id, userData) => api.patch(`/api/auth/users/${id}/`, userData),
  deleteUser: (id) => api.delete(`/api/auth/users/${id}/`),
};

// Purchase Request API
export const requestsAPI = {
  getRequests: (params) => api.get('/api/requests/', { params }),
  createRequest: (data) => api.post('/api/requests/', data),
  getRequest: (id) => api.get(`/api/requests/${id}/`),
  updateRequest: (id, data) => api.patch(`/api/requests/${id}/`, data),
  deleteRequest: (id) => api.delete(`/api/requests/${id}/`),
  approveRequest: (id, data) => api.post(`/api/requests/${id}/approve/`, data),
  uploadReceipt: (id, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post(`/api/requests/${id}/receipt/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Add proforma upload method
  uploadProforma: (id, file) => {
    const formData = new FormData();
    formData.append('proforma', file);
    return api.post(`/api/documents/upload-proforma/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getWorkflow: (id) => api.get(`/api/requests/${id}/workflow/`),
  getMyRequests: () => api.get('/api/my-requests/'),
  getPendingApprovals: () => api.get('/api/pending-approvals/'),
  getFinanceRequests: () => api.get('/api/finance-requests/'),
  getDashboardStats: () => api.get('/api/dashboard-stats/'),
  // Analytics endpoints
  getAnalytics: (params) => api.get('/api/analytics/', { params }),
  getSpendingTrend: (params) => api.get('/api/analytics/spending-trend/', { params }),
  getStatusBreakdown: (params) => api.get('/api/analytics/status-breakdown/', { params }),
  getDepartmentSpending: (params) => api.get('/api/analytics/department-spending/', { params }),
  getProcessingTimes: (params) => api.get('/api/analytics/processing-times/', { params }),
};

// Documents API
export const documentsAPI = {
  getProcessingStatus: (requestId, jobId) => api.get(`/api/documents/status/${requestId}/${jobId}/`),
  getCometProcessingStatus: (requestId, jobId) => api.get(`/api/documents/comet-status/${requestId}/${jobId}/`),
  uploadProforma: (id, file) => {
    const formData = new FormData();
    formData.append('proforma', file);
    return api.post(`/api/documents/upload-proforma/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadReceipt: (requestId, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post(`/api/requests/${requestId}/receipt/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  triggerProcessing: (id, data) => api.post(`/api/documents/trigger/${id}/`, data),
  triggerCometProcessing: (id, data) => api.post(`/api/documents/comet-process/${id}/`, data),
  getProcessingJobs: (requestId) => api.get(`/api/documents/jobs/${requestId}/`),
  getJobDetails: (id) => api.get(`/api/documents/jobs/${id}/`),
  getOllamaStatus: () => api.get('/api/documents/ollama-status/'),
  getCometStatus: () => api.get('/api/documents/comet-status/'),
  getProcessingStats: () => api.get('/api/documents/processing-stats/'),
};

export default api;