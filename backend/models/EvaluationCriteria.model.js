const mongoose = require('mongoose');

const evaluationCriteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Criteria name is required'],
      trim: true,
      maxlength: [150],
    },
    description: {
      type: String,
      maxlength: [500],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [1, 'Weight must be at least 1'],
      max: [100, 'Weight cannot exceed 100'],
      default: 10,
    },
    maxScore: {
      type: Number,
      default: 10,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null = applies to all categories
    },
    criteriaType: {
      type: String,
      enum: ['organizational', 'individual'],
      default: 'organizational',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stage: {
      type: String,
      enum: ['initial', 'f2f'],
      default: 'initial',
      required: true,
    },
  },
  { timestamps: true }
);

const EvaluationCriteria = mongoose.model('EvaluationCriteria', evaluationCriteriaSchema);
module.exports = EvaluationCriteria;
