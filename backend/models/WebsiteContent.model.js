const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: [true, 'Page is required'],
      trim: true,
      lowercase: true,
    },
    key: {
      type: String,
      required: [true, 'Content key is required'],
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'richtext', 'json', 'list'],
      default: 'text',
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

websiteContentSchema.index({ page: 1, key: 1 }, { unique: true });

const WebsiteContent = mongoose.model('WebsiteContent', websiteContentSchema);
module.exports = WebsiteContent;
