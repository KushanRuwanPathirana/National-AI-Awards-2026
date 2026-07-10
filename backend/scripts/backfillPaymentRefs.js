const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Application = require('../models/Application.model');
const connectDB = require('../config/db');

const backfill = async () => {
  try {
    await connectDB();
    const apps = await Application.find({
      referenceNumber: { $exists: true, $ne: null },
      $or: [
        { paymentReference: { $exists: false } },
        { paymentReference: null },
        { paymentReference: '' }
      ]
    });
    console.log(`Found ${apps.length} applications to backfill payment reference.`);
    for (const app of apps) {
      app.paymentReference = `PAY-${app.referenceNumber}`;
      await app.save();
      console.log(`Backfilled reference: ${app.referenceNumber} -> ${app.paymentReference}`);
    }
    console.log('Backfill completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
};

backfill();
