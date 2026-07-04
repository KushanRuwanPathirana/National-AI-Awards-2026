import api from './api';

const evaluationService = {
  getAssignedApplications: (params) => api.get('/evaluations/assigned', { params }),
  getJudgeStats: () => api.get('/evaluations/judge/stats'),
  getOrCreateEvaluation: (applicationId) => api.get(`/evaluations/application/${applicationId}`),
  saveEvaluation: (applicationId, data) => api.post(`/evaluations/application/${applicationId}`, data),
  getEvaluationsByApplication: (applicationId) => api.get(`/evaluations/admin/application/${applicationId}`),
};

export default evaluationService;

