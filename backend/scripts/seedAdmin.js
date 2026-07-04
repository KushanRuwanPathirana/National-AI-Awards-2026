require('../config/env');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const seedDefaultAdmin = async ({ skipConnect = false } = {}) => {
  try {
    if (!skipConnect && mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@123';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
        phone: '+94 11 234 5678',
        organization: 'National AI Awards Council',
        designation: 'Chief Administrator',
      });
      await adminUser.save();
      logger.info(`✅ Seeded default admin: ${adminEmail} / ${adminPassword}`);
      return adminUser;
    }

    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save({ validateBeforeSave: false });
      logger.info(`✅ Updated existing user to admin role: ${adminEmail}`);
    }

    logger.info(`Default admin already exists: ${adminEmail}`);
    return existingAdmin;
  } catch (error) {
    logger.error(`❌ Admin seeding failed: ${error.message}`);
    throw error;
  }
};

if (require.main === module) {
  seedDefaultAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`❌ Seeding failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { seedDefaultAdmin };
