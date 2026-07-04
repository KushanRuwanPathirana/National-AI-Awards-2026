import api from './api';

const contentService = {
  getContent: (params) => api.get('/content', { params }),
  getById: (id) => api.get(`/content/${id}`),
  createContent: (data) => api.post('/content', data),
  updateContent: (id, data) => api.put(`/content/${id}`, data),
  deleteContent: (id) => api.delete(`/content/${id}`),
};

export default contentService;
