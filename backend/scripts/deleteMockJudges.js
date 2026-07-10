require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Judge = require('../models/Judge.model');

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to database.');

    const result = await Judge.deleteMany({ email: { $regex: /@naiawards\.lk$/i } });
    console.log(`Successfully deleted ${result.deletedCount} mock judges.`);

    mongoose.connection.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Error running script:', err.message);
    process.exit(1);
  }
};

run();
