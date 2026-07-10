const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Evaluation = require('../models/Evaluation.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');
const { sendJudgeReminder } = require('./email.service');
const logger = require('../utils/logger');

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

const sendPendingJudgeReminderBatch = async ({ performedBy, ipAddress, userAgent, source = 'manual' } = {}) => {
  const audience = await getPendingJudgeAudience();
  if (audience.length === 0) {
    return {
      recipients: 0,
      failedEmailCount: 0,
      pendingEvaluations: 0,
      recipientEmails: [],
    };
  }

  const notifications = audience.map((entry) => ({
    recipient: entry.user._id,
    type: 'evaluation_reminder',
    title: 'Action Required: Pending Nomination Evaluation',
    message: `You have ${entry.pendingCount} assigned nomination evaluation(s) still pending. Please log in to the Judge Portal and submit your scorecards.`,
    link: '/judge-dashboard',
    metadata: {
      pendingCount: entry.pendingCount,
      closestProjectTitle: entry.closestProjectTitle,
      closestDeadline: entry.closestDeadline,
      source,
    },
  }));
  await Notification.insertMany(notifications);

  const emailResults = await Promise.allSettled(
    audience
      .filter((entry) => entry.user.email)
      .map((entry) => sendJudgeReminder(
        entry.user,
        entry.pendingCount,
        entry.closestDeadline ? entry.closestDeadline.toISOString() : null,
        entry.closestProjectTitle
      ))
  );
  const failedEmailCount = emailResults.filter((result) => result.status === 'rejected').length;
  if (failedEmailCount > 0) {
    logger.error(`Pending judge reminder email failed for ${failedEmailCount} judge(s).`);
  }

  if (performedBy) {
    await AuditLog.create({
      action: 'admin_action',
      performedBy,
      targetModel: 'User',
      description: `Sent pending evaluation reminders to ${audience.length} judge(s).`,
      ipAddress,
      userAgent,
    });
  }

  return {
    recipients: audience.length,
    failedEmailCount,
    pendingEvaluations: audience.reduce((sum, entry) => sum + entry.pendingCount, 0),
    recipientEmails: audience.map((entry) => entry.user.email).filter(Boolean),
  };
};

module.exports = {
  getPendingJudgeAudience,
  sendPendingJudgeReminderBatch,
};
