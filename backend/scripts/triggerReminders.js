const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { sendDailyJudgeReminders } = require('../services/reminder.service');

dotenv.config({ path: '../.env' });

const triggerReminders = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error('MONGODB_URL environment variable is missing.');
    }
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB.');

    console.log('Starting manual reminder dispatch...');
    await sendDailyJudgeReminders();
    console.log('Reminder dispatch completed successfully.');

    mongoose.connection.close();
  } catch (err) {
    console.error('Trigger error:', err);
  }
};

triggerReminders();
