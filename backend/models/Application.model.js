const mongoose = require('mongoose');
const Counter = require('./Counter.model');
const { APPLICATION_STATUS } = require('../config/constants');

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
      trim: true,
      maxlength: [150, 'Project title cannot exceed 150 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [250, 'Tagline cannot exceed 250 characters'],
    },

    // Section A: Applicant & Organisation Details
    organisationName: {
      type: String,
      trim: true,
      maxlength: [200],
    },
    registrationNumber: { type: String, trim: true, maxlength: [100] },
    sectorIndustry: { type: String, trim: true, maxlength: [150] },
    organisationSize: {
      type: String,
      enum: ['Univercity student', 'Startup', 'Coparate', 'Gov Institute', 'Acadamic', ''],
      default: '',
    },
    primaryContactName: { type: String, trim: true, maxlength: [150] },
    primaryContactDesignation: { type: String, trim: true, maxlength: [150] },
    primaryContactEmail: { type: String, trim: true, lowercase: true, maxlength: [200] },
    primaryContactPhone: { type: String, trim: true, maxlength: [50] },
    authorisedSignatory: { type: String, trim: true, maxlength: [150] },
    websiteLinkedIn: { type: String, trim: true, maxlength: [500] },

    // Step 2: Eligibility
    eligibilityAnswers: [eligibilityAnswerSchema],
    isEligible: {
      type: Boolean,
      default: null, // null = not yet assessed
    },
    categoryEligibilityConfirmed: {
      type: Boolean,
      default: false,
    },

    // Step 3: Application Form
    problemStatement: {
      type: String,
      maxlength: [3000, 'Problem statement cannot exceed 3000 characters'],
    },
    solution: {
      type: String,
      maxlength: [6000, 'Solution description cannot exceed 6000 characters'],
    },
    aiTechnologies: {
      type: String, // comma-separated or free text
      maxlength: [3000],
    },
    innovationDetails: {
      type: String,
      maxlength: [3000],
    },
    impactDetails: {
      type: String,
      maxlength: [3000],
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
    deploymentStatus: {
      type: String,
      enum: ['Pilot', 'Live in production', 'Scaling', ''],
      default: '',
    },
    launchDate: { type: Date },
    customerReferenceRevenue: { type: String, maxlength: [1000] },

    // Section D: Evidence Against Judging Criteria
    innovationOriginality: { type: String, maxlength: [3000] },
    measurableImpact: { type: String, maxlength: [3000] },
    technicalExcellence: { type: String, maxlength: [3000] },
    responsibleAI: { type: String, maxlength: [3000] },
    scalabilitySustainability: { type: String, maxlength: [3000] },
    executionEvidence: { type: String, maxlength: [3000] },

    // Section E/F: Supporting Materials and Sri Lanka relevance
    demoVideoUrl: { type: String, trim: true, maxlength: [500] },
    testimonialOne: { type: String, maxlength: [1000] },
    testimonialTwo: { type: String, maxlength: [1000] },
    nationalRelevance: { type: String, maxlength: [3000] },

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
    verificationConsent: {
      type: Boolean,
      default: false,
    },
    promotionalConsent: {
      type: Boolean,
      default: false,
    },
    conflictDisclosure: {
      type: String,
      maxlength: [2000],
    },
    submissionFeeAcknowledged: {
      type: Boolean,
      default: false,
    },
    declarationDate: {
      type: Date,
    },

    // Payment fields
    paymentMethod: {
      type: String,
      enum: ['transfer', 'online', 'none', ''],
      default: '',
    },
    paymentSlip: {
      originalName: { type: String },
      filePath:     { type: String },
      mimeType:     { type: String },
      size:         { type: Number },
      uploadedAt:   { type: Date },
    },
    onlinePaymentSimulated: {
      type: Boolean,
      default: false,
    },

    // Step tracking for wizard
    completedStep: {
      type: Number,
      default: 0,
      min: 0,
      max: 8,
    },

    // Submission metadata
    submittedAt: { type: Date },
    referenceNumber: { type: String, unique: true, sparse: true },

    // Admin notes
    adminNotes: { type: String },

    // Per-application deadline
    deadline: { type: Date },

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
    initial_stage: 'Initial State',
    f2f_stage:    'Selected to Face-to-Face',
    finalist:     'Finalist',
    winner:       'Winner',
    runner_up:    '1st Runner-up',
  };
  return labels[this.status] || this.status;
});

const REFERENCE_PREFIX = 'AIAW2026';
const REFERENCE_COUNTER_KEY = 'application_reference_number';

const buildReferenceNumber = (sequence) => `${REFERENCE_PREFIX}-${String(sequence).padStart(5, '0')}`;

const getHighestExistingReferenceSequence = async () => {
  const latestApplication = await mongoose.model('Application')
    .findOne({ referenceNumber: { $regex: `^${REFERENCE_PREFIX}-\\d+$` } })
    .sort({ referenceNumber: -1 })
    .select('referenceNumber')
    .lean();

  if (!latestApplication?.referenceNumber) return 0;

  const sequence = Number(latestApplication.referenceNumber.replace(`${REFERENCE_PREFIX}-`, ''));
  return Number.isFinite(sequence) ? sequence : 0;
};

const generateReferenceNumber = async () => {
  const highestExistingSequence = await getHighestExistingReferenceSequence();

  await Counter.updateOne(
    { key: REFERENCE_COUNTER_KEY },
    { $max: { value: highestExistingSequence } },
    { upsert: true }
  );

  const counter = await Counter.findOneAndUpdate(
    { key: REFERENCE_COUNTER_KEY },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return buildReferenceNumber(counter.value);
};

// ── Pre-save: generate reference number ────────────────────────────────────────

applicationSchema.pre('save', async function (next) {
  try {
    if (!this.referenceNumber && this.status !== APPLICATION_STATUS.DRAFT) {
      this.referenceNumber = await generateReferenceNumber();
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

// ── Indexes ────────────────────────────────────────────────────────────────────
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ category: 1 });
applicationSchema.index({ createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
