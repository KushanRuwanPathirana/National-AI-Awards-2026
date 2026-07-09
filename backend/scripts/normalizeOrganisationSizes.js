const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Application = require('../models/Application.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const sizeMap = {
  'Startup <4 yrs': 'Startup',
  SME: 'Startup',
  'Large Enterprise': 'Coparate',
  Government: 'Gov Institute',
  Academic: 'Acadamic',
};

const normalizeOrganisationSizes = async () => {
  try {
    await connectDB();

    let updatedCount = 0;
    for (const [oldValue, newValue] of Object.entries(sizeMap)) {
      const result = await Application.updateMany(
        { organisationSize: oldValue },
        { $set: { organisationSize: newValue } },
        { runValidators: false }
      );
      updatedCount += result.modifiedCount;
      logger.info(`Mapped "${oldValue}" to "${newValue}" for ${result.modifiedCount} application(s).`);
    }

    logger.info(`Organisation size normalization completed. Updated ${updatedCount} application(s).`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Organisation size normalization failed: ${error.message}`);
    process.exit(1);
  }
};

normalizeOrganisationSizes();
