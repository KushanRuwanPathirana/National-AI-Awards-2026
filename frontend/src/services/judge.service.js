import api from './api';

const judgeService = {
  getJudges: (params) => api.get('/judges', { params }),
  getJudgeById: (id) => api.get(`/judges/${id}`),
  createJudge: (data) => api.post('/judges', data),
  updateJudge: (id, data) => api.put(`/judges/${id}`, data),
  uploadJudgePhoto: (id, formData) =>
    api.patch(`/judges/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteJudge: (id) => api.delete(`/judges/${id}`),
  sendWelcomeEmails: () => api.post('/judges/send-welcome'),
};

export default judgeService;
