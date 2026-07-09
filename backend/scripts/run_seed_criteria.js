const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedCriteriaOnStartup } = require('./seedCriteria');

dotenv.config({ path: '../.env' });

const runSeed = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB.');

    await seedCriteriaOnStartup();
    console.log('Criteria seed complete.');

    mongoose.connection.close();
  } catch (err) {
    console.error('Seed error:', err);
  }
};

runSeed();
