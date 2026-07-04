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
  changeStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  assignJudges: (id, judgeIds) => api.patch(`/applications/${id}/assign-judges`, { judgeIds }),
};

export default applicationService;
