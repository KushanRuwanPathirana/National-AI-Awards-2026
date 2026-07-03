const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getAssignedApplications, getOrCreateEvaluation,
  saveEvaluation, getEvaluationsByApplication,
} = require('../controllers/evaluation.controller');

// Judge
router.get('/assigned',              authenticate, requireRole('judge'), getAssignedApplications);
router.get('/application/:applicationId', authenticate, requireRole('judge'), getOrCreateEvaluation);
router.post('/application/:applicationId', authenticate, requireRole('judge'), saveEvaluation);

// Admin
router.get('/admin/application/:applicationId', authenticate, requireRole('admin'), getEvaluationsByApplication);

module.exports = router;
