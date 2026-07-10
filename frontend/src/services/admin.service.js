import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReports: () => api.get('/admin/reports'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getPendingJudgeAudience: () => api.get('/admin/pending-judge-audience'),
  sendPendingJudgeReminders: () => api.post('/admin/reminders/pending-judges'),
  getPendingJudgeReminderSchedule: () => api.get('/admin/reminders/pending-judges/schedule'),
  schedulePendingJudgeReminders: (data) => api.post('/admin/reminders/pending-judges/schedule', data),
  broadcastNotification: (data) => api.post('/admin/broadcast', data),
};

export default adminService;
