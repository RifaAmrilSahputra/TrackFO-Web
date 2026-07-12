import api from './api';

/**
 * API Client untuk mengelola semua request API
 * Base URL: http://localhost:3000/api
 */

// ============= AUTH =============
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  changePassword: (data) => api.patch('/auth/change-password', data),
  resetUserPassword: (id, newPassword) => api.patch(`/auth/users/${id}/password`, { newPassword }),
};

// ============= USERS =============
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getAdmins: () => api.get('/users/admins'),
  getTechnicians: (params) => api.get('/users/teknisi', { params }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAreas: () => api.get('/users/areas'),
};

// ============= ISSUES / GANGGUAN =============
export const issueAPI = {
  create: (issueData) => api.post('/issues', issueData),
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  update: (id, issueData) => api.patch(`/issues/${id}`, issueData),
  remove: (id) => api.delete(`/issues/${id}`),
  getMyTasks: () => api.get('/issues/my/tasks'),
  assignTechnician: (issueId, assignmentData) => api.post(`/issues/${issueId}/assign`, assignmentData),
  getAssignments: (issueId) => api.get(`/issues/${issueId}/assignments`),
  updateAssignmentStatus: (assignmentId, status) => api.patch(`/issues/assignment/${assignmentId}/status`, { status }),
};

// ============= TRACKING =============
export const trackingAPI = {
  create: (trackingData) => api.post('/tracking', trackingData),

  // endpoint lama
  getAll: (params) => api.get('/tracking', { params }),

  getGangguanList: () => api.get('/tracking/gangguan'),

  // endpoint baru
  getByGangguan: (gangguanId) =>
    api.get(`/tracking/gangguan/${gangguanId}`),

  getByTechnician: (teknisiId) =>
    api.get(`/tracking/teknisi/${teknisiId}`),
};

// ============= REPORTS =============
export const reportAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (reportData) => api.post('/reports', reportData),
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
  delete: (id) => api.delete(`/reports/${id}`),
  getMyReports: (params) => api.get('/reports/my', { params }),
  generateReport: (params) => api.post('/reports/generate', params),
  exportReport: (id, format) => api.get(`/reports/${id}/export/${format}`, { responseType: 'blob' }),
};

// ============= ASSIGNMENTS =============
export const assignmentAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (assignmentData) => api.post('/assignments', assignmentData),
  update: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  delete: (id) => api.delete(`/assignments/${id}`),
  getByStatus: (status, params) => api.get(`/assignments/status/${status}`, { params }),
};

// ============= FAULTS =============
export const faultAPI = {
  getAll: (params) => api.get('/faults', { params }),
  getById: (id) => api.get(`/faults/${id}`),
  create: (faultData) => api.post('/faults', faultData),
  update: (id, faultData) => api.put(`/faults/${id}`, faultData),
  delete: (id) => api.delete(`/faults/${id}`),
  getByStatus: (status, params) => api.get(`/faults/status/${status}`, { params }),
};

// ============= TECHNICIANS =============
export const technicianAPI = {
  getAll: (params) => api.get('/technicians', { params }),
  getById: (id) => api.get(`/technicians/${id}`),
  create: (technicianData) => api.post('/technicians', technicianData),
  update: (id, technicianData) => api.put(`/technicians/${id}`, technicianData),
  delete: (id) => api.delete(`/technicians/${id}`),
  getAvailable: (params) => api.get('/technicians/available', { params }),
};

// ============= DASHBOARD =============
export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  getCharts: (params) => api.get('/dashboard/charts', { params }),
  getSummary: () => api.get('/dashboard/summary'),
  getDashboard: () => api.get("/dashboard"),
};

// ============= GENERIC METHODS =============
/**
 * Method generic untuk custom endpoint
 * Gunakan jika endpoint tidak ada di API yang sudah didefinisikan
 */
export const genericAPI = {
  get: (endpoint, params) => api.get(endpoint, { params }),
  post: (endpoint, data) => api.post(endpoint, data),
  put: (endpoint, data) => api.put(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
  patch: (endpoint, data) => api.patch(endpoint, data),
};


export default api;
