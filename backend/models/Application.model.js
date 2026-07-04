const mongoose = require('mongoose');
const { APPLICATION_STATUS, AWARD_CATEGORIES } = require('../config/constants');

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const eligibilityAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: Boolean, required: true },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  fieldName:    { type: String, required: true }, // e.g. 'projectReport'
  originalName: { type: String, required: true },
  filePath:     { type: String, required: true },
  mimeType:     { type: String },
  size:         { type: Number },
  uploadedAt:   { type: Date, default: Date.now },
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, enum: Object.values(APPLICATION_STATUS) },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note:      { type: String },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

// ── Main Application Schema ────────────────────────────────────────────────────

const applicationSchema = new mongoose.Schema(
  {
    // Relations
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Award category is required'],
    },
    assignedJudges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    // Status & Workflow
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.DRAFT,
      index: true,
    },
    statusHistory: [statusHistorySchema],

    // Step 1: Basic Info
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Project title cannot exceed 150 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [250, 'Tagline cannot exceed 250 characters'],
    },

    // Step 2: Eligibility
    eligibilityAnswers: [eligibilityAnswerSchema],
    isEligible: {
      type: Boolean,
      default: null, // null = not yet assessed
    },

    // Step 3: Application Form
    problemStatement: {
      type: String,
      maxlength: [2000, 'Problem statement cannot exceed 2000 characters'],
    },
    solution: {
      type: String,
      maxlength: [2000, 'Solution description cannot exceed 2000 characters'],
    },
    aiTechnologies: {
      type: String, // comma-separated or free text
      maxlength: [500],
    },
    innovationDetails: {
      type: String,
      maxlength: [2000],
    },
    impactDetails: {
      type: String,
      maxlength: [2000],
    },
    teamSize: {
      type: Number,
      min: 1,
      max: 100,
    },
    teamMembers: {
      type: String,
      maxlength: [1000],
    },
    projectUrl: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
      maxlength: [200],
    },
    projectStartYear: {
      type: Number,
    },

    // Step 4: Documents
    documents: [documentSchema],

    // Step 5: Declaration
    declarationAccepted: {
      type: Boolean,
      default: false,
    },
    declarationDate: {
      type: Date,
    },

    // Step tracking for wizard
    completedStep: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Submission metadata
    submittedAt: { type: Date },
    referenceNumber: { type: String, unique: true, sparse: true },

    // Admin notes
    adminNotes: { type: String },

    // Scores (aggregated from evaluations)
    averageScore: { type: Number, default: 0 },
    evaluationCount: { type: Number, default: 0 },

    // Awards & publishing
    publishedAsFinalist: { type: Boolean, default: false },
    publishedAsWinner: { type: Boolean, default: false },
    certificateNumber: { type: String, trim: true },
    certificateIssuedAt: { type: Date },
    awardCitation: { type: String, maxlength: [2000] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ───────────────────────────────────────────────────────────────────

applicationSchema.virtual('isSubmitted').get(function () {
  return this.status !== APPLICATION_STATUS.DRAFT;
});

applicationSchema.virtual('statusLabel').get(function () {
  const labels = {
    draft:        'Draft',
    submitted:    'Submitted',
    under_review: 'Under Review',
    eligible:     'Eligible',
    ineligible:   'Ineligible',
    shortlisted:  'Shortlisted',
    finalist:     'Finalist',
    winner:       'Winner',
    runner_up:    'Runner-up',
  };
  return labels[this.status] || this.status;
});

// ── Pre-save: generate reference number ────────────────────────────────────────

applicationSchema.pre('save', async function (next) {
  if (!this.referenceNumber && this.status !== 'draft') {
    const count = await mongoose.model('Application').countDocuments();
    this.referenceNumber = `AIAW2026-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ── Indexes ────────────────────────────────────────────────────────────────────
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ category: 1 });
applicationSchema.index({ createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
