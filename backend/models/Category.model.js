const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Category description is required'],
      maxlength: [2000],
    },
    shortDescription: {
      type: String,
      maxlength: [300],
    },
    icon: {
      type: String,
      default: 'RiAwardLine',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    eligibilityCriteria: [{
      type: String,
      maxlength: [500],
    }],
    eligibilityQuestions: [{
      question: { type: String, required: true },
      requiredAnswer: { type: Boolean, required: true, default: true }, // must answer true to be eligible
    }],
    evaluationCriteria: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvaluationCriteria',
    }],
    maxApplications: {
      type: Number,
      default: null, // null = unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    // Statistics (updated by aggregation)
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});

categorySchema.index({ isActive: 1, order: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
