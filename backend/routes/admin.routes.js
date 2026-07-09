const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getDashboardStats, getUsers, createUser, toggleUserStatus, deleteUser,
  updateUserRole, getReports, getAuditLogs, broadcastNotification,
  getEvaluationDeadline, updateEvaluationDeadline,
} = require('../controllers/admin.controller');

// All admin-only
router.use(authenticate, requireRole('admin'));

router.get('/stats',             getDashboardStats);
router.get('/users',             getUsers);
router.post('/users',            createUser);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/role',   updateUserRole);
router.delete('/users/:id',      deleteUser);
router.get('/reports',           getReports);
router.get('/audit-logs',        getAuditLogs);
router.post('/broadcast',        broadcastNotification);

router.get('/settings/evaluation-deadline', getEvaluationDeadline);
router.post('/settings/evaluation-deadline', updateEvaluationDeadline);

module.exports = router;
