const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dropEvaluationIndex = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      console.error('MONGODB_URL not found in env');
      return;
    }
    console.log('Connecting to Mongo...');
    await mongoose.connect(mongoUrl);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'evaluations' }).toArray();
    if (collections.length > 0) {
      console.log('Dropping index application_1_judge_1 on evaluations...');
      try {
        await db.collection('evaluations').dropIndex('application_1_judge_1');
        console.log('Successfully dropped index.');
      } catch (err) {
        if (err.codeName === 'IndexNotFound') {
          console.log('Index application_1_judge_1 was not found or already dropped.');
        } else {
          throw err;
        }
      }
    } else {
      console.log('Evaluations collection does not exist yet.');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error dropping index:', err);
    process.exit(1);
  }
};

dropEvaluationIndex();
