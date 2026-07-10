const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Evaluation = require('../models/Evaluation.model');
const Category = require('../models/Category.model');
const AuditLog = require('../models/AuditLog.model');
const Notification = require('../models/Notification.model');
const Setting = require('../models/Setting.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendBroadcastEmail, sendJudgeReminder } = require('../services/email.service');
const {
  getPendingJudgeAudience: getPendingJudgeReminderAudience,
  sendPendingJudgeReminderBatch,
} = require('../services/pendingJudgeReminder.service');
const logger = require('../utils/logger');

const BROADCAST_APPLICATION_STATUSES = ['submitted', 'under_review', 'eligible', 'shortlisted', 'finalist', 'winner'];
const F2F_ACTIVE_STATUSES = ['f2f_stage'];

const getPendingJudgeAudience = async () => {
  const apps = await Application.find({
    status: { $ne: 'draft' },
    $or: [
      { assignedJudges: { $exists: true, $ne: [] } },
      { assignedJudgesF2F: { $exists: true, $ne: [] } },
    ],
  }).select('projectTitle assignedJudges assignedJudgesF2F deadline deadlineF2F status');

  const appIds = apps.map((app) => app._id);
  const submittedEvaluations = await Evaluation.find({
    application: { $in: appIds },
    isSubmitted: true,
  }).select('application judge stage');

  const submittedKeys = new Set(
    submittedEvaluations.map((evaluation) => (
      `${evaluation.judge?.toString()}:${evaluation.application?.toString()}:${evaluation.stage || 'initial'}`
    ))
  );

  const pendingByJudge = new Map();
  const addPendingAssignment = (judgeId, app, stage, deadline) => {
    if (!judgeId) return;
    const judgeIdStr = judgeId.toString();
    const submittedKey = `${judgeIdStr}:${app._id.toString()}:${stage}`;
    if (submittedKeys.has(submittedKey)) return;

    const existing = pendingByJudge.get(judgeIdStr) || {
      judgeId: judgeIdStr,
      pendingCount: 0,
      closestDeadline: null,
      closestProjectTitle: null,
    };

    existing.pendingCount += 1;
    const deadlineDate = deadline ? new Date(deadline) : null;
    if (deadlineDate && !Number.isNaN(deadlineDate.getTime())) {
      if (!existing.closestDeadline || deadlineDate < existing.closestDeadline) {
        existing.closestDeadline = deadlineDate;
        existing.closestProjectTitle = app.projectTitle;
      }
    } else if (!existing.closestProjectTitle) {
      existing.closestProjectTitle = app.projectTitle;
    }

    pendingByJudge.set(judgeIdStr, existing);
  };

  apps.forEach((app) => {
    (app.assignedJudges || []).forEach((judgeId) => addPendingAssignment(judgeId, app, 'initial', app.deadline));
    if (F2F_ACTIVE_STATUSES.includes(app.status)) {
      (app.assignedJudgesF2F || []).forEach((judgeId) => addPendingAssignment(judgeId, app, 'f2f', app.deadlineF2F || app.deadline));
    }
  });

  const pendingRows = Array.from(pendingByJudge.values());
  if (pendingRows.length === 0) return [];

  const users = await User.find({
    _id: { $in: pendingRows.map((row) => row.judgeId) },
    role: 'judge',
    isActive: true,
  }).select('_id firstName lastName email');
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return pendingRows
    .map((row) => ({ ...row, user: usersById.get(row.judgeId) }))
    .filter((row) => row.user)
    .sort((a, b) => b.pendingCount - a.pendingCount);
};

// ── Dashboard Stats ─────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalApplications, totalCandidates, totalJudges,
      draftApps, submittedApps, initialStageApps, f2fStageApps, finalistApps, winnerApps,
      pendingEvaluations, completedEvaluations,
      recentApplications, categoryBreakdown, submissionTrend,
      recentActivities, notifications,
    ] = await Promise.all([
      Application.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'judge' }),
      Application.countDocuments({ status: 'draft' }),
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
          draftApps,
          submittedApps,
          initialStageApps,
          f2fStageApps,
          finalistApps,
          selectedToNextRoundApps: initialStageApps + f2fStageApps + finalistApps,
          winnerApps,
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
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    user.role = role;
    if (!user.registrationNumber && ['candidate', 'judge'].includes(role)) {
      user.registrationNumber = await User.generateRegistrationNumberForRole(role);
    }
    await user.save({ validateBeforeSave: false });
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
    const { title, message, role, status, audience, link } = req.body;
    if (!title || !message) return errorResponse(res, { statusCode: 400, message: 'Title and message required.' });

    let users = [];
    let pendingAudience = [];

    if (audience === 'pending_judges' || role === 'pending_judges') {
      pendingAudience = await getPendingJudgeAudience();
      users = pendingAudience.map((entry) => entry.user);
    } else if (status) {
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
      data: {
        recipients: users.length,
        failedEmailCount,
        pendingEvaluations: pendingAudience.reduce((sum, entry) => sum + entry.pendingCount, 0),
      },
    });
  } catch (error) { next(error); }
};

const getPendingJudgeAudienceSummary = async (req, res, next) => {
  try {
    const audience = await getPendingJudgeReminderAudience();
    return successResponse(res, {
      data: {
        judges: audience.map((entry) => ({
          judgeId: entry.judgeId,
          name: `${entry.user.firstName} ${entry.user.lastName}`,
          email: entry.user.email,
          pendingCount: entry.pendingCount,
          closestDeadline: entry.closestDeadline,
          closestProjectTitle: entry.closestProjectTitle,
        })),
        judgeCount: audience.length,
        pendingEvaluations: audience.reduce((sum, entry) => sum + entry.pendingCount, 0),
      },
    });
  } catch (error) { next(error); }
};

const sendPendingJudgeReminders = async (req, res, next) => {
  try {
    const result = await sendPendingJudgeReminderBatch({
      performedBy: req.user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      source: 'manual',
    });
    if (result.recipients === 0) {
      return successResponse(res, {
        message: 'No judges have pending evaluations.',
        data: { recipients: 0, failedEmailCount: 0, pendingEvaluations: 0 },
      });
    }

    return successResponse(res, {
      message: result.failedEmailCount > 0
        ? `Reminder sent to ${result.recipients} judge(s). Email failed for ${result.failedEmailCount} judge(s).`
        : `Reminder email sent to ${result.recipients} judge(s).`,
      data: result,
    });
  } catch (error) { next(error); }
};

const getPendingJudgeReminderSchedule = async (req, res, next) => {
  try {
    const setting = await Setting.findOne({ key: 'pending_judge_reminder_schedule' });
    return successResponse(res, { data: { schedule: setting?.value || null } });
  } catch (error) { next(error); }
};

const schedulePendingJudgeReminders = async (req, res, next) => {
  try {
    const { runAt } = req.body;
    const runAtDate = runAt ? new Date(runAt) : null;
    if (!runAtDate || Number.isNaN(runAtDate.getTime())) {
      return errorResponse(res, { statusCode: 400, message: 'A valid reminder date and time is required.' });
    }
    if (runAtDate <= new Date()) {
      return errorResponse(res, { statusCode: 400, message: 'Reminder schedule time must be in the future.' });
    }

    const value = {
      status: 'scheduled',
      runAt: runAtDate,
      createdBy: req.user._id,
      createdAt: new Date(),
      lastRunAt: null,
      lastResult: null,
    };

    await Setting.findOneAndUpdate(
      { key: 'pending_judge_reminder_schedule' },
      {
        key: 'pending_judge_reminder_schedule',
        value,
        description: 'Admin scheduled pending judge reminder dispatch',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await AuditLog.create({
      action: 'admin_action',
      performedBy: req.user._id,
      targetModel: 'Setting',
      description: `Scheduled pending judge reminders for ${runAtDate.toISOString()}.`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return successResponse(res, {
      message: `Pending judge reminders scheduled for ${runAtDate.toLocaleString()}.`,
      data: { schedule: value },
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
  updateUserRole, getReports, getAuditLogs, broadcastNotification,
  getPendingJudgeAudienceSummary, sendPendingJudgeReminders,
  getPendingJudgeReminderSchedule, schedulePendingJudgeReminders
};
