const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUrl = process.env.MONGODB_URL;

const AwardImage = require('./models/AwardImage.model');

const run = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB successfully!');
    
    const image = await AwardImage.findOne();
    if (!image) {
      console.error('No image found!');
      mongoose.connection.close();
      return;
    }
    console.log('Found image:', image._id);
    
    image.categoryId = "";
    await image.save();
    console.log('Successfully saved image with categoryId = ""!');

  } catch (error) {
    console.error('Save error:', error);
  }

  await mongoose.connection.close();
};

run();
