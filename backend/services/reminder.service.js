const User = require('../models/User.model');
const Application = require('../models/Application.model');
const Evaluation = require('../models/Evaluation.model');
const Setting = require('../models/Setting.model');
const Notification = require('../models/Notification.model');
const { sendJudgeReminder } = require('./email.service');
const logger = require('../utils/logger');

/**
 * Checks all judges and sends reminders to those with uncompleted assignments
 * Uses per-application deadlines instead of global deadline
 */
const sendDailyJudgeReminders = async () => {
  try {
    // 1. Fetch all verified judges
    const judges = await User.find({ role: 'judge', isEmailVerified: true });
    
    // 2. Fetch all active applications with deadlines
    const apps = await Application.find({ 
      status: { $ne: 'draft' },
      deadline: { $exists: true, $ne: null }
    }).populate('assignedJudges', 'firstName lastName email').select('assignedJudges deadline projectTitle');

    // 3. Fetch all submitted evaluations
    const evaluations = await Evaluation.find({ isSubmitted: true }).select('judge application');

    logger.info(`Checking reminders for ${judges.length} judges with ${apps.length} applications having deadlines...`);

    let reminderCount = 0;

    for (const judge of judges) {
      const judgeIdStr = judge._id.toString();

      // Get applications assigned to this judge with deadlines
      const assignedApps = apps.filter(app =>
        app.assignedJudges.some(jId => jId._id.toString() === judgeIdStr)
      );

      if (assignedApps.length === 0) continue; // No assignments, no reminder needed

      // Check which applications have pending evaluations
      const pendingApps = [];
      for (const app of assignedApps) {
        const isCompleted = evaluations.some(e => 
          e.judge?.toString() === judgeIdStr && 
          e.application?.toString() === app._id.toString()
        );
        if (!isCompleted) {
          pendingApps.push(app);
        }
      }

      if (pendingApps.length > 0) {
        // Find the closest upcoming deadline
        const now = new Date();
        const upcomingDeadlines = pendingApps
          .map(app => ({
            app,
            deadline: new Date(app.deadline),
            daysUntil: Math.ceil((new Date(app.deadline) - now) / (1000 * 60 * 60 * 24))
          }))
          .filter(item => item.daysUntil >= 0)
          .sort((a, b) => a.daysUntil - b.daysUntil);

        if (upcomingDeadlines.length > 0) {
          const closest = upcomingDeadlines[0];
          reminderCount++;
          logger.info(`Sending reminder to Judge: ${judge.firstName} ${judge.lastName} (${pendingApps.length} pending, closest deadline: ${closest.daysUntil} days)`);

          // Send database notification
          try {
            await Notification.create({
              recipient: judge._id,
              type: 'evaluation_reminder',
              title: 'Action Required: Pending Evaluations Reminder',
              message: `You have ${pendingApps.length} pending application evaluation(s). The closest deadline is ${closest.app.projectTitle} due in ${closest.daysUntil} day(s).`,
              link: '/dashboard',
            });
          } catch (notifErr) {
            logger.error(`Failed to create database notification for ${judge.email}: ${notifErr.message}`);
          }

          // Send email reminder with closest deadline info
          try {
            await sendJudgeReminder(judge, pendingApps.length, closest.deadline.toISOString(), closest.app.projectTitle);
          } catch (emailErr) {
            logger.error(`Failed to send email reminder to ${judge.email}: ${emailErr.message}`);
          }
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
