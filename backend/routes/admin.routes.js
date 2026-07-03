const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getDashboardStats, getUsers, toggleUserStatus, deleteUser,
  updateUserRole, getReports, getAuditLogs, broadcastNotification,
} = require('../controllers/admin.controller');

// All admin-only
router.use(authenticate, requireRole('admin'));

router.get('/stats',             getDashboardStats);
router.get('/users',             getUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/role',   updateUserRole);
router.delete('/users/:id',      deleteUser);
router.get('/reports',           getReports);
router.get('/audit-logs',        getAuditLogs);
router.post('/broadcast',        broadcastNotification);

module.exports = router;
