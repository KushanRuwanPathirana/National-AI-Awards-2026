const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getDashboardStats, getUsers, createUser, toggleUserStatus, deleteUser,
  updateUserRole, getReports, getAuditLogs, broadcastNotification,
  getPendingJudgeAudienceSummary, sendPendingJudgeReminders,
  getPendingJudgeReminderSchedule, schedulePendingJudgeReminders,
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
router.get('/pending-judge-audience', getPendingJudgeAudienceSummary);
router.get('/reminders/pending-judges/schedule', getPendingJudgeReminderSchedule);
router.post('/broadcast',        broadcastNotification);
router.post('/reminders/pending-judges', sendPendingJudgeReminders);
router.post('/reminders/pending-judges/schedule', schedulePendingJudgeReminders);

module.exports = router;
