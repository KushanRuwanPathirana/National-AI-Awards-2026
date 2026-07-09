const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Evaluation = require('../models/Evaluation.model');
const Category = require('../models/Category.model');
const AuditLog = require('../models/AuditLog.model');
const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendBroadcastEmail } = require('../services/email.service');
const logger = require('../utils/logger');

const BROADCAST_APPLICATION_STATUSES = ['submitted', 'under_review', 'eligible', 'shortlisted', 'finalist', 'winner'];

// ── Dashboard Stats ─────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalApplications, totalCandidates, totalJudges,
      submittedApps, initialStageApps, f2fStageApps, finalistApps, winnerApps,
      pendingEvaluations, completedEvaluations,
      recentApplications, categoryBreakdown, submissionTrend,
      recentActivities, notifications,
    ] = await Promise.all([
      Application.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'judge' }),
      Application.countDocuments({ status: 'submitted' }),
      Application.countDocuments({ status: 'initial_stage' }),
      Application.countDocuments({ status: 'f2f_stage' }),
      Application.countDocuments({ status: 'finalist' }),
      Application.countDocuments({ status: 'winner' }),
      Evaluation.countDocuments({ isSubmitted: false }),
      Evaluation.countDocuments({ isSubmitted: true }),
      Application.find()
        .populate('candidate', 'firstName lastName email')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Application.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { _id: 0, name: '$category.name', count: 1 } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { '_id': 1 } },
        { $limit: 30 },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
      AuditLog.find({}).populate('performedBy', 'firstName lastName role').sort({ createdAt: -1 }).limit(8),
      Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(8),
    ]);

    // Status distribution
    const statusBreakdown = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);

    return successResponse(res, {
      data: {
        stats: {
          totalApplications, totalCandidates, totalJudges,
          submittedApps, initialStageApps, f2fStageApps, finalistApps, winnerApps,
          pendingEvaluations, completedEvaluations,
        },
        recentApplications,
        categoryBreakdown,
        submissionTrend,
        statusBreakdown,
        recentActivities,
        notifications,
      },
    });
  } catch (error) { next(error); }
};

// ── Get All Users ──────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return successResponse(res, { data: { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) { next(error); }
};

// ── Toggle User Status ─────────────────────────────────────────────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, { statusCode: 400, message: 'Cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      action: user.isActive ? 'user_updated' : 'user_deactivated',
      performedBy: req.user._id,
      targetModel: 'User', targetId: user._id,
      description: `User ${user.isActive ? 'activated' : 'deactivated'}: ${user.email}`,
      ipAddress: req.ip,
    });

    return successResponse(res, { message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { user } });
  } catch (error) { next(error); }
};

// ── Delete User ────────────────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, { statusCode: 400, message: 'Cannot delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await AuditLog.create({ action: 'user_deleted', performedBy: req.user._id, targetModel: 'User', targetId: user._id, description: `Deleted: ${user.email}`, ipAddress: req.ip });

    return successResponse(res, { message: 'User deleted.' });
  } catch (error) { next(error); }
};

// ── Update User Role ──────────────────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'judge', 'candidate'].includes(role)) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    return successResponse(res, { message: 'Role updated.', data: { user } });
  } catch (error) { next(error); }
};

// ── Reports ───────────────────────────────────────────────────────────────────
const getReports = async (req, res, next) => {
  try {
    const [categoryBreakdown, statusBreakdown, topScored, submissionTrend, judgeProgress] = await Promise.all([
      Application.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: '$cat' },
        { $project: { name: '$cat.name', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      Application.find({ status: { $in: ['initial_stage','f2f_stage','finalist','winner','runner_up'] } })
        .select('projectTitle averageScore status')
        .populate('category', 'name')
        .sort({ averageScore: -1 })
        .limit(10),
      Application.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
        { $limit: 60 },
      ]),
      Evaluation.aggregate([
        { $group: {
          _id: '$judge',
          submitted: { $sum: { $cond: ['$isSubmitted', 1, 0] } },
          total: { $sum: 1 },
          avgScore: { $avg: '$weightedScore' },
        }},
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'judge' } },
        { $unwind: '$judge' },
        { $project: { name: { $concat: ['$judge.firstName', ' ', '$judge.lastName'] }, submitted: 1, total: 1, avgScore: 1, _id: 0 } },
      ]),
    ]);

    return successResponse(res, { data: { categoryBreakdown, statusBreakdown, topScored, submissionTrend, judgeProgress } });
  } catch (error) { next(error); }
};

// ── Get Audit Logs ─────────────────────────────────────────────────────────────
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const filter = {};
    if (action) filter.action = action;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('performedBy', 'firstName lastName role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      AuditLog.countDocuments(filter),
    ]);
    return successResponse(res, { data: { logs, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
  } catch (error) { next(error); }
};

// ── Broadcast Notification ─────────────────────────────────────────────────────
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, role, status, link } = req.body;
    if (!title || !message) return errorResponse(res, { statusCode: 400, message: 'Title and message required.' });

    let users = [];

    if (status) {
      if (!BROADCAST_APPLICATION_STATUSES.includes(status)) {
        return errorResponse(res, { statusCode: 400, message: 'Invalid application status audience.' });
      }

      const candidateIds = await Application.distinct('candidate', { status });
      users = await User.find({ _id: { $in: candidateIds }, role: 'candidate' }).select('_id firstName email');
    } else {
      const filter = {};
      if (role && role !== 'all') filter.role = role;
      users = await User.find(filter).select('_id firstName email');
    }

    const alertLink = link || '/dashboard';
    const notifications = users.map(u => ({ recipient: u._id, type: 'system', title, message, link: alertLink }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    const emailResults = await Promise.allSettled(
      users
        .filter(user => user.email)
        .map(user => sendBroadcastEmail(user, { title, message, link: alertLink }))
    );
    const failedEmailCount = emailResults.filter(result => result.status === 'rejected').length;
    if (failedEmailCount > 0) {
      logger.error(`Broadcast email failed for ${failedEmailCount} user(s).`);
    }

    return successResponse(res, {
      message: failedEmailCount > 0
        ? `Notification sent to ${users.length} user(s). Email failed for ${failedEmailCount} user(s).`
        : `Notification and email sent to ${users.length} user(s).`,
      data: { recipients: users.length, failedEmailCount },
    });
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, organization, designation } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return errorResponse(res, { statusCode: 400, message: 'First name, last name, email, and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, { statusCode: 409, message: 'An account with this email already exists.' });

    const user = await User.create({ firstName, lastName, email, password, role: role || 'candidate', phone, organization, designation, isEmailVerified: true });
    return successResponse(res, { statusCode: 201, message: 'User created.', data: { user } });
  } catch (error) { next(error); }
};

module.exports = {
  getDashboardStats, getUsers, createUser, toggleUserStatus, deleteUser,
  updateUserRole, getReports, getAuditLogs, broadcastNotification
};
