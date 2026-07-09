import api from './api';

const evaluationService = {
  getAssignedApplications: (params) => api.get('/evaluations/assigned', { params }),
  getJudgeStats: (params) => api.get('/evaluations/judge/stats', { params }),
  getOrCreateEvaluation: (applicationId, params) => api.get(`/evaluations/application/${applicationId}`, { params }),
  saveEvaluation: (applicationId, data, params) => api.post(`/evaluations/application/${applicationId}`, data, { params }),
  getEvaluationsByApplication: (applicationId) => api.get(`/evaluations/admin/application/${applicationId}`),
  getEvaluationTracker: (params) => api.get('/evaluations/admin/tracker', { params }),
};

export default evaluationService;

