const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Application = require('./models/Application.model');
const Evaluation = require('./models/Evaluation.model');
const User = require('./models/User.model');

dotenv.config();

const runCheck = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB.');

    const evaluations = await Evaluation.find()
      .populate('application', 'projectTitle')
      .populate('judge', 'firstName lastName email');

    console.log(`\nFound ${evaluations.length} evaluations in total:\n`);
    evaluations.forEach((ev, idx) => {
      console.log(`[Evaluation ${idx + 1}]`);
      console.log(`  Application: ${ev.application?.projectTitle} (${ev.application?._id})`);
      console.log(`  Judge: ${ev.judge?.firstName} ${ev.judge?.lastName}`);
      console.log(`  Stage: ${ev.stage}`);
      console.log(`  isSubmitted: ${ev.isSubmitted}`);
      console.log(`  isDraft: ${ev.isDraft}`);
      console.log(`  totalScore: ${ev.totalScore}`);
      console.log(`  weightedScore: ${ev.weightedScore}`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error('Check error:', err);
  }
};

runCheck();
