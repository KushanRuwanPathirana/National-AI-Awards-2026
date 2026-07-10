const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const backfillJudgeRegistrationNumbers = async () => {
  try {
    await connectDB();

    const judges = await User.find({
      role: 'judge',
      $or: [
        { registrationNumber: { $exists: false } },
        { registrationNumber: '' },
        { registrationNumber: null },
      ],
    }).sort({ createdAt: 1 });

    logger.info(`Found ${judges.length} judge user(s) without a registration number.`);

    for (const judge of judges) {
      judge.registrationNumber = await User.generateRegistrationNumberForRole('judge');
      await judge.save({ validateBeforeSave: false });
      logger.info(`Assigned ${judge.registrationNumber} to ${judge.email}`);
    }

    logger.info('Judge registration number backfill completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Judge registration number backfill failed: ${error.message}`);
    process.exit(1);
  }
};

backfillJudgeRegistrationNumbers();
