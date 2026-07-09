const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  criteria:   { type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationCriteria', required: true },
  score:      { type: Number, required: true, min: 0, max: 25 },
  comment:    { type: String, maxlength: 500 },
}, { _id: false });

const evaluationSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Judge reference is required'],
    },
    scores: [scoreSchema],
    totalScore: {
      type: Number,
      default: 0,
    },
    weightedScore: {
      type: Number,
      default: 0,
    },
    overallComments: {
      type: String,
      maxlength: [3000],
    },
    strengths: {
      type: String,
      maxlength: [1000],
    },
    weaknesses: {
      type: String,
      maxlength: [1000],
    },
    recommendation: {
      type: String,
      enum: ['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend'],
    },
    confidentialityAccepted: {
      type: Boolean,
      default: false,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    stage: {
      type: String,
      enum: ['initial', 'f2f'],
      default: 'initial',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique constraint: one evaluation per judge per application per stage
evaluationSchema.index({ application: 1, judge: 1, stage: 1 }, { unique: true });
evaluationSchema.index({ judge: 1, isSubmitted: 1 });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
module.exports = Evaluation;
