import api from './api';

const evaluationCriteriaService = {
  getAllCriteria: (params) => api.get('/evaluation-criteria', { params }),
  getById: (id) => api.get(`/evaluation-criteria/${id}`),
  createCriteria: (data) => api.post('/evaluation-criteria', data),
  updateCriteria: (id, data) => api.put(`/evaluation-criteria/${id}`, data),
  deleteCriteria: (id) => api.delete(`/evaluation-criteria/${id}`),
  seedDefaults: () => api.post('/evaluation-criteria/seed'),
};

export default evaluationCriteriaService;
