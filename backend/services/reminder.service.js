const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Evaluation = require('../models/Evaluation.model');
const Setting = require('../models/Setting.model');
const Notification = require('../models/Notification.model');
const { sendJudgeReminder } = require('./email.service');
const logger = require('../utils/logger');

/**
 * Checks all judges and sends reminders to those with uncompleted assignments
 */
const sendDailyJudgeReminders = async () => {
  try {
    // 1. Fetch the evaluation deadline
    const deadlineSetting = await Setting.findOne({ key: 'evaluation_deadline' });
    const deadlineStr = deadlineSetting ? deadlineSetting.value : '2026-08-31T23:59:59+05:30';

    // 2. Fetch all verified judges
    const judges = await User.find({ role: 'judge', isEmailVerified: true });
    
    // 3. Fetch all active applications
    const apps = await Application.find({ status: { $ne: 'draft' } }).select('assignedJudges');

    // 4. Fetch all submitted evaluations
    const evaluations = await Evaluation.find({ isSubmitted: true }).select('judge');

    logger.info(`Checking reminders for ${judges.length} judges...`);

    let reminderCount = 0;

    for (const judge of judges) {
      const judgeIdStr = judge._id.toString();

      // Count assignments
      const assignedApps = apps.filter(app =>
        app.assignedJudges.some(jId => jId.toString() === judgeIdStr)
      );
      const assignedCount = assignedApps.length;

      if (assignedCount === 0) continue; // No assignments, no reminder needed

      // Count completed
      const completedCount = evaluations.filter(e => e.judge?.toString() === judgeIdStr).length;

      const pendingCount = assignedCount - completedCount;

      if (pendingCount > 0) {
        // This judge has pending/uncompleted evaluations!
        reminderCount++;
        logger.info(`Sending reminder to Judge: ${judge.firstName} ${judge.lastName} (${pendingCount} pending)`);

        // Send database notification
        try {
          await Notification.create({
            recipient: judge._id,
            type: 'evaluation_reminder',
            title: 'Action Required: Pending Evaluations Reminder',
            message: `You have ${pendingCount} pending application evaluation(s) assigned to you. Please complete them before the evaluation deadline.`,
            link: '/dashboard',
          });
        } catch (notifErr) {
          logger.error(`Failed to create database notification for ${judge.email}: ${notifErr.message}`);
        }

        // Send email reminder
        try {
          await sendJudgeReminder(judge, pendingCount, deadlineStr);
        } catch (emailErr) {
          logger.error(`Failed to send email reminder to ${judge.email}: ${emailErr.message}`);
        }
      }
    }

    logger.info(`Daily reminders processed. Sent reminders to ${reminderCount} judges.`);
  } catch (error) {
    logger.error(`Error sending daily judge reminders: ${error.message}`);
  }
};

let lastNotificationDate = '';

/**
 * Starts a background timer checking every minute to trigger the reminder at exactly 9:00 AM local time
 */
const startReminderScheduler = () => {
  logger.info('Initializing Daily Judge Reminder Scheduler (9:00 AM)...');

  setInterval(async () => {
    try {
      const now = new Date();
      const todayStr = now.toDateString();

      // Run daily at exactly 9:00 AM
      if (now.getHours() === 9 && now.getMinutes() === 0 && lastNotificationDate !== todayStr) {
        lastNotificationDate = todayStr;
        logger.info('Cron Scheduler triggered: sending daily reminders...');
        await sendDailyJudgeReminders();
      }
    } catch (err) {
      logger.error(`Error in reminder scheduler tick: ${err.message}`);
    }
  }, 60000); // Check once a minute
};

module.exports = {
  sendDailyJudgeReminders,
  startReminderScheduler,
};
