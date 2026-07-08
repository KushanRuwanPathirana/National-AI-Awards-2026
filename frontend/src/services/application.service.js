import api from './api';

const applicationService = {
  // Candidate
  createDraft: (data) => api.post('/applications', data),
  updateDraft: (id, data) => api.put(`/applications/${id}`, data),
  submitApplication: (id) => api.post(`/applications/${id}/submit`),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  uploadDocuments: (id, formData) => api.post(`/applications/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (appId, docId) => api.delete(`/applications/${appId}/documents/${docId}`),
  deleteApplication: (id) => api.delete(`/applications/${id}`),

  // Admin
  getAllApplications: (params) => api.get('/applications', { params }),
  getMonitoringOverview: () => api.get('/applications/monitoring'),
  getJudgeProgress: () => api.get('/applications/judge-progress'),
  exportApplications: (format = 'csv') => api.get('/applications/export', { params: { format }, responseType: 'blob' }),
  publishFinalists: (ids) => api.post('/applications/publish-finalists', { ids }),
  publishWinners: (ids) => api.post('/applications/publish-winners', { ids }),
  generateCertificates: (ids) => api.post('/applications/generate-certificates', { ids }),
  changeStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  assignJudges: (id, judgeIds) => api.patch(`/applications/${id}/assign-judges`, { judgeIds }),
  reviewEligibility: (id, data) => api.patch(`/applications/${id}/review-eligibility`, data),
  deleteApplicationAsAdmin: (id) => api.delete(`/applications/admin/${id}`),
};

export default applicationService;
