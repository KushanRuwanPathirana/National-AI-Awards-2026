const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const adminEmail = 'admin@aiawards.lk';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info(`Admin user with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    // Create default admin user
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: 'AdminPassword126!', // default secure temporary password
      role: 'admin',
      isEmailVerified: true,
      phone: '+94 11 234 5678',
      organization: 'National AI Awards Council',
      designation: 'Chief Administrator',
    });

    await adminUser.save();
    logger.info(`✅ Successfully seeded default admin account!`);
    logger.info(`Email: ${adminEmail}`);
    logger.info(`Password: AdminPassword126!`);
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
