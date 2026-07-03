const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const seedUsers = async () => {
  try {
    await connectDB();

    // 1. Seed Admin
    const adminEmail = 'admin@aiawards.lk';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminUser = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: adminEmail,
        password: 'AdminPassword126!',
        role: 'admin',
        isEmailVerified: true,
        phone: '+94 11 234 5678',
        organization: 'National AI Awards Council',
        designation: 'Chief Administrator',
      });
      await adminUser.save();
      logger.info(`✅ Seeded Admin: ${adminEmail} / AdminPassword126!`);
    } else {
      logger.info(`Admin user already exists.`);
    }

    // 2. Seed Candidate (Applicant)
    const candidateEmail = 'candidate@aiawards.lk';
    const existingCandidate = await User.findOne({ email: candidateEmail });
    if (!existingCandidate) {
      const candidateUser = new User({
        firstName: 'John',
        lastName: 'Innovator',
        email: candidateEmail,
        password: 'CandidatePassword126!',
        role: 'candidate',
        isEmailVerified: true,
        phone: '+94 77 123 4567',
        organization: 'Sri Lanka AI Lab',
        designation: 'Lead Researcher',
      });
      await candidateUser.save();
      logger.info(`✅ Seeded Candidate: ${candidateEmail} / CandidatePassword126!`);
    } else {
      logger.info(`Candidate user already exists.`);
    }

    // 3. Seed Judge
    const judgeEmail = 'judge@aiawards.lk';
    const existingJudge = await User.findOne({ email: judgeEmail });
    if (!existingJudge) {
      const judgeUser = new User({
        firstName: 'Dr. Sarah',
        lastName: 'Evaluator',
        email: judgeEmail,
        password: 'JudgePassword126!',
        role: 'judge',
        isEmailVerified: true,
        phone: '+94 71 987 6543',
        organization: 'University of Moratuwa',
        designation: 'Professor in AI',
      });
      await judgeUser.save();
      logger.info(`✅ Seeded Judge: ${judgeEmail} / JudgePassword126!`);
    } else {
      logger.info(`Judge user already exists.`);
    }

    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
