const mongoose = require('mongoose');

const awardImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Image title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    thumbnailUrl: {
      type: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AwardImageCategory',
    },
    eventYear: {
      type: Number,
      default: 2026,
    },
    featuredOnHomepage: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

awardImageSchema.index({ status: 1, displayOrder: 1 });
awardImageSchema.index({ categoryId: 1 });
awardImageSchema.index({ featuredOnHomepage: 1, displayOrder: 1 });
awardImageSchema.index({ eventYear: 1 });

const AwardImage = mongoose.model('AwardImage', awardImageSchema);
module.exports = AwardImage;
