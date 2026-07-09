const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category.model');
const connectDB = require('../config/db');
const { AWARD_CATEGORIES } = require('../config/constants');
const logger = require('../utils/logger');

const migrateCategories = async () => {
  try {
    await connectDB();

    logger.info('Deleting existing award categories...');
    await Category.deleteMany({});

    logger.info('Seeding updated categories according to the fields...');
    const defaults = AWARD_CATEGORIES.map((name, i) => ({
      name,
      description: `Applications for AI innovations in the ${name} category. Submit groundbreaking solutions that leverage AI to transform this domain.`,
      shortDescription: `AI solutions transforming ${name.toLowerCase()}.`,
      isActive: true,
      order: i + 1,
      eligibilityQuestions: [
        { question: 'Does your solution use Artificial Intelligence or Machine Learning as a core component?', requiredAnswer: true },
        { question: 'Is your solution operational or in advanced prototype stage?', requiredAnswer: true },
        { question: 'Is the primary focus of your solution within this category?', requiredAnswer: true },
      ],
    }));

    for (const cat of defaults) {
      await Category.create(cat);
      logger.info(`✅ Seeded Category: "${cat.name}"`);
    }

    logger.info('Categories migration completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Migration failed: ${error.message}`);
    process.exit(1);
  }
};

migrateCategories();
