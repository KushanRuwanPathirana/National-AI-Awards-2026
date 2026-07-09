const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Application = require('../models/Application.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const backfillApplicationIds = async () => {
  try {
    await connectDB();

    const applications = await Application.find({
      $or: [
        { applicationId: { $exists: false } },
        { applicationId: '' },
        { applicationId: null },
      ],
    }).sort({ createdAt: 1 });

    logger.info(`Found ${applications.length} application(s) without an application ID.`);

    for (const application of applications) {
      await application.save({ validateBeforeSave: false });
      logger.info(`Assigned ${application.applicationId} to ${application._id}`);
    }

    logger.info('Application ID backfill completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Application ID backfill failed: ${error.message}`);
    process.exit(1);
  }
};

backfillApplicationIds();
