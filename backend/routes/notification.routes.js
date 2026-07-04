const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notification.controller');

router.get('/',                authenticate, getNotifications);
router.patch('/:id/read',      authenticate, markAsRead);
router.patch('/read-all',      authenticate, markAllAsRead);
router.delete('/:id',          authenticate, deleteNotification);

module.exports = router;
