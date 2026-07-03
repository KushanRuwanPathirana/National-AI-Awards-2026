const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ── Get User Notifications ─────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return successResponse(res, {
      data: { notifications, unreadCount, pagination: { total, page: parseInt(page), limit: parseInt(limit) } },
    });
  } catch (error) { next(error); }
};

// ── Mark Single Notification Read ─────────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return successResponse(res, { message: 'Marked as read.' });
  } catch (error) { next(error); }
};

// ── Mark All Notifications Read ────────────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, { message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
};

// ── Delete Notification ────────────────────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    return successResponse(res, { message: 'Notification deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
