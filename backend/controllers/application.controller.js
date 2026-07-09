const Application = require('../models/Application.model');
const Category = require('../models/Category.model');
const Evaluation = require('../models/Evaluation.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { APPLICATION_DEADLINE, APPLICATION_STATUS, ALLOWED_TRANSITIONS } = require('../config/constants');
const { sendApplicationStatusUpdate } = require('../services/email.service');
const logger = require('../utils/logger');
const { buildApplicationsCsv, buildSimplePdf } = require('../utils/reportExporter');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// ── Helpers ────────────────────────────────────────────────────────────────────
const getPublicUploadPath = (file) => path.posix.join('uploads', 'documents', file.filename);

const hasApplicationDeadlinePassed = () => Date.now() >= new Date(APPLICATION_DEADLINE.CLOSES_AT).getTime();

const rejectAfterApplicationDeadline = (res) => {
  if (!hasApplicationDeadlinePassed()) return false;
  errorResponse(res, {
    statusCode: 403,
    message: `Applications can no longer be created, edited, or submitted after the ${APPLICATION_DEADLINE.DISPLAY_DATE} deadline.`,
  });
  return true;
};

const resolveStoredFilePath = (filePath) => {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  if (path.isAbsolute(normalized)) return normalized;
  return path.join(__dirname, '..', normalized);
};

const createNotification = async ({ recipient, type, title, message, link, relatedApplication }) => {
  try {
    await Notification.create({ recipient, type, title, message, link, relatedApplication });
  } catch (e) {
    logger.error(`Notification create failed: ${e.message}`);
  }
};

const createAuditLog = async ({ action, performedBy, targetId, description, oldValue, newValue, req }) => {
  try {
    await AuditLog.create({
      action, performedBy, targetModel: 'Application', targetId, description, oldValue, newValue,
      ipAddress: req?.ip, userAgent: req?.headers?.['user-agent'],
    });
  } catch (e) {
    logger.error(`AuditLog create failed: ${e.message}`);
  }
};

const removeApplicationRecord = async ({ application, performedBy, req }) => {
  // Delete associated files from disk
  if (application.documents && application.documents.length > 0) {
    application.documents.forEach(doc => {
      const diskPath = resolveStoredFilePath(doc.filePath);
      if (diskPath && fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          logger.error(`Failed to delete document file from disk: ${e.message}`);
        }
      }
    });
  }

  await Promise.all([
    Evaluation.deleteMany({ application: application._id }),
    Notification.deleteMany({ relatedApplication: application._id }),
    Application.deleteOne({ _id: application._id }),
  ]);

  await createAuditLog({
    action: 'application_deleted',
    performedBy,
    targetId: application._id,
    description: `Application deleted: ${application.projectTitle} (${application.status})`,
    req
  });
};

// ── Create Draft ───────────────────────────────────────────────────────────────
const createApplication = async (req, res, next) => {
  try {
    if (rejectAfterApplicationDeadline(res)) return;

    const { categoryId, projectTitle, tagline, organisationName, organizationName } = req.body;

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return errorResponse(res, { statusCode: 400, message: 'Please select a valid award category.' });
      }

      const category = await Category.findById(categoryId);
      if (!category || !category.isActive) {
        return errorResponse(res, { statusCode: 404, message: 'Category not found or inactive.' });
      }
    }

    const application = await Application.create({
      candidate: req.user._id,
      ...(categoryId ? { category: categoryId } : {}),
      projectTitle,
      tagline,
      organisationName: organisationName || organizationName,
      organizationName: organisationName || organizationName,
      registrationNumber: req.user.registrationNumber || '',
      status: APPLICATION_STATUS.DRAFT,
      completedStep: req.body.completedStep || 0,
      statusHistory: [{ status: APPLICATION_STATUS.DRAFT, changedBy: req.user._id, note: 'Application created' }],
    });

    await createAuditLog({ action: 'application_created', performedBy: req.user._id, targetId: application._id, description: `New draft: ${projectTitle || organisationName || organizationName || 'Untitled application'}`, req });

    return successResponse(res, { statusCode: 201, message: 'Application draft created.', data: { application } });
  } catch (error) { next(error); }
};

// ── Update Draft (multi-step) ──────────────────────────────────────────────────
const updateApplication = async (req, res, next) => {
  try {
    if (rejectAfterApplicationDeadline(res)) return;

    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Only draft applications can be edited.' });
    }

    if (req.body.categoryId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
        return errorResponse(res, { statusCode: 400, message: 'Please select a valid award category.' });
      }
      const category = await Category.findById(req.body.categoryId);
      if (!category || !category.isActive) {
        return errorResponse(res, { statusCode: 404, message: 'Category not found or inactive.' });
      }
      application.category = req.body.categoryId;
    }

    const allowedFields = [
      'projectTitle', 'tagline', 'eligibilityAnswers', 'isEligible',
      'problemStatement', 'solution', 'aiTechnologies', 'innovationDetails',
      'impactDetails', 'teamSize', 'teamMembers', 'projectUrl', 'organizationName',
      'projectStartYear', 'declarationAccepted', 'declarationDate', 'completedStep',
      'organisationName', 'sectorIndustry', 'organisationSize',
      'primaryContactName', 'primaryContactDesignation', 'primaryContactEmail',
      'primaryContactPhone', 'authorisedSignatory', 'websiteLinkedIn',
      'categoryEligibilityConfirmed', 'deploymentStatus', 'launchDate',
      'customerReferenceRevenue', 'innovationOriginality', 'measurableImpact',
      'technicalExcellence', 'responsibleAI', 'scalabilitySustainability',
      'executionEvidence', 'demoVideoUrl', 'testimonialOne', 'testimonialTwo',
      'nationalRelevance', 'verificationConsent', 'promotionalConsent',
      'conflictDisclosure', 'submissionFeeAcknowledged',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) application[field] = req.body[field];
    });

    application.registrationNumber = req.user.registrationNumber || '';

    await application.save();
    return successResponse(res, { message: 'Application updated.', data: { application } });
  } catch (error) { next(error); }
};

// ── Submit Application ─────────────────────────────────────────────────────────
const submitApplication = async (req, res, next) => {
  try {
    if (rejectAfterApplicationDeadline(res)) return;

    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id }).populate('category');

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Only draft applications can be submitted.' });
    }
    if (!application.category || !application.projectTitle) {
      return errorResponse(res, { statusCode: 400, message: 'Please select a category and enter a project title before submitting.' });
    }
    if (!application.declarationAccepted) {
      return errorResponse(res, { statusCode: 400, message: 'You must accept the declaration before submitting.' });
    }
    if (!application.verificationConsent || !application.promotionalConsent || !application.submissionFeeAcknowledged) {
      return errorResponse(res, { statusCode: 400, message: 'Please complete all required declarations and consents before submitting.' });
    }
    if (!application.problemStatement || !application.solution) {
      return errorResponse(res, { statusCode: 400, message: 'Please complete all required form fields before submitting.' });
    }
    if (!application.organisationName || !application.primaryContactName || !application.primaryContactEmail || !application.categoryEligibilityConfirmed) {
      return errorResponse(res, { statusCode: 400, message: 'Please complete applicant details and category eligibility confirmation before submitting.' });
    }

    application.status = APPLICATION_STATUS.SUBMITTED;
    application.submittedAt = new Date();
    application.declarationDate = new Date();
    application.statusHistory.push({ status: APPLICATION_STATUS.SUBMITTED, changedBy: req.user._id, note: 'Submitted by candidate' });

    await application.save();

    // Reference number generated in pre-save hook
    await createNotification({
      recipient: req.user._id,
      type: 'application_submitted',
      title: 'Application Submitted Successfully',
      message: `Your application "${application.projectTitle}" has been submitted. Reference: ${application.referenceNumber}`,
      link: `/dashboard/applications/${application._id}`,
      relatedApplication: application._id,
    });

    await createAuditLog({ action: 'application_submitted', performedBy: req.user._id, targetId: application._id, description: `Submitted: ${application.projectTitle}`, req });

    try {
      await sendApplicationStatusUpdate(req.user, application, APPLICATION_STATUS.SUBMITTED);
    } catch (e) { logger.error(`Submit email error: ${e.message}`); }

    return successResponse(res, { message: 'Application submitted successfully!', data: { application } });
  } catch (error) { next(error); }
};

// ── Get Candidate's Applications ───────────────────────────────────────────────
const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { candidate: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('category', 'name slug icon color')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(filter),
    ]);

    return successResponse(res, {
      data: { applications, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) { next(error); }
};

// ── Get Single Application ─────────────────────────────────────────────────────
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = { _id: id };

    // Candidates can only view their own
    if (req.user.role === 'candidate') filter.candidate = req.user._id;

    const application = await Application.findOne(filter)
      .populate('candidate', 'firstName lastName email organization')
      .populate('category', 'name slug icon color description')
      .populate('assignedJudges', 'firstName lastName email');

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    return successResponse(res, { data: { application } });
  } catch (error) { next(error); }
};

// ── Admin: Get All Applications ────────────────────────────────────────────────
const getAllApplications = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('candidate', 'firstName lastName email organization')
        .populate('category', 'name slug icon')
        .populate('assignedJudges', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(filter),
    ]);

    return successResponse(res, {
      data: { applications, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) { next(error); }
};

// ── Admin: Change Status (Workflow Engine) ─────────────────────────────────────
const changeApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) return errorResponse(res, { statusCode: 400, message: 'New status is required.' });

    const application = await Application.findById(id).populate('candidate', 'firstName email');
    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    const allowed = ALLOWED_TRANSITIONS[application.status] || [];
    if (!allowed.includes(status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Cannot transition from "${application.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}.`,
      });
    }

    const oldStatus = application.status;
    application.status = status;
    application.statusHistory.push({ status, changedBy: req.user._id, note: note || `Status changed to ${status}` });
    await application.save();

    // Notify candidate
    await createNotification({
      recipient: application.candidate._id,
      type: 'application_status_changed',
      title: `Application Status Updated`,
      message: `Your application "${application.projectTitle}" status changed to: ${application.statusLabel}`,
      link: `/dashboard/applications/${application._id}`,
      relatedApplication: application._id,
    });

    await createAuditLog({
      action: 'status_changed', performedBy: req.user._id, targetId: application._id,
      description: `Status: ${oldStatus} → ${status}`, oldValue: oldStatus, newValue: status, req,
    });

    try {
      await sendApplicationStatusUpdate(application.candidate, application, status);
    } catch (e) { logger.error(`Status email error: ${e.message}`); }

    return successResponse(res, { message: `Status updated to "${status}".`, data: { application } });
  } catch (error) { next(error); }
};

// ── Admin: Assign Judges ───────────────────────────────────────────────────────
const assignJudges = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judgeIds } = req.body;

    if (!judgeIds || !Array.isArray(judgeIds)) {
      return errorResponse(res, { statusCode: 400, message: 'judgeIds array is required.' });
    }

    const application = await Application.findById(id).populate('candidate', 'firstName email');
    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    application.assignedJudges = judgeIds;
    await application.save();

    // Notify each judge
    for (const judgeId of judgeIds) {
      await createNotification({
        recipient: judgeId,
        type: 'judge_assigned',
        title: 'New Application Assigned',
        message: `You have been assigned to evaluate "${application.projectTitle}".`,
        link: `/judge-dashboard/evaluate/${application._id}`,
        relatedApplication: application._id,
      });
    }

    await createAuditLog({ action: 'judge_assigned', performedBy: req.user._id, targetId: application._id, description: `Assigned ${judgeIds.length} judge(s)`, req });

    const updated = await Application.findById(id).populate('assignedJudges', 'firstName lastName email');
    return successResponse(res, { message: 'Judges assigned successfully.', data: { application: updated } });
  } catch (error) { next(error); }
};

// ── Upload Documents ───────────────────────────────────────────────────────────
const uploadDocuments = async (req, res, next) => {
  try {
    if (rejectAfterApplicationDeadline(res)) return;

    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Documents can only be uploaded to draft applications.' });
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, { statusCode: 400, message: 'No files uploaded.' });
    }
    if (application.documents.length + req.files.length > 2) {
      return errorResponse(res, { statusCode: 400, message: 'Maximum 2 PDF documents can be uploaded per application.' });
    }

    const newDocs = req.files.map(f => ({
      fieldName: f.fieldname,
      originalName: f.originalname,
      filePath: getPublicUploadPath(f),
      mimeType: f.mimetype,
      size: f.size,
    }));

    application.documents.push(...newDocs);
    await application.save();

    return successResponse(res, { message: `${newDocs.length} document(s) uploaded.`, data: { documents: application.documents } });
  } catch (error) { next(error); }
};

// ── Delete Document ────────────────────────────────────────────────────────────
const deleteDocument = async (req, res, next) => {
  try {
    if (rejectAfterApplicationDeadline(res)) return;

    const { id, docId } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Documents can only be removed from draft applications.' });
    }

    const docIndex = application.documents.findIndex(d => d._id.toString() === docId);
    if (docIndex === -1) return errorResponse(res, { statusCode: 404, message: 'Document not found.' });

    const doc = application.documents[docIndex];
    // Remove file from disk
    const diskPath = resolveStoredFilePath(doc.filePath);
    if (diskPath && fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    application.documents.splice(docIndex, 1);
    await application.save();

    return successResponse(res, { message: 'Document deleted.' });
  } catch (error) { next(error); }
};

// ── Delete Application (Draft Only) ──────────────────────────────────────────
const reviewEligibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isEligible, note } = req.body;

    const application = await Application.findById(id);
    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    application.isEligible = isEligible;
    application.adminNotes = note || application.adminNotes || '';
    application.statusHistory.push({ status: application.status, changedBy: req.user._id, note: `Eligibility screened: ${isEligible ? 'eligible' : 'ineligible'}` });
    await application.save();

    await createAuditLog({ action: 'eligibility_reviewed', performedBy: req.user._id, targetId: application._id, description: `Eligibility reviewed: ${isEligible ? 'eligible' : 'ineligible'}`, req });

    return successResponse(res, { message: 'Eligibility reviewed.', data: { application } });
  } catch (error) { next(error); }
};

const getMonitoringOverview = async (req, res, next) => {
  try {
    const [total, pending, screened, assigned, completedEvaluation, pendingEvaluation] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'submitted' }),
      Application.countDocuments({ isEligible: { $ne: null } }),
      Application.countDocuments({ assignedJudges: { $exists: true, $ne: [] } }),
      Evaluation.countDocuments({ isSubmitted: true }),
      Evaluation.countDocuments({ isSubmitted: false }),
    ]);

    return successResponse(res, { data: { overview: { total, pending, screened, assigned, completedEvaluation, pendingEvaluation } } });
  } catch (error) { next(error); }
};

const getJudgeProgress = async (req, res, next) => {
  try {
    const progress = await Evaluation.aggregate([
      { $group: { _id: '$judge', submitted: { $sum: { $cond: ['$isSubmitted', 1, 0] } }, pending: { $sum: { $cond: ['$isSubmitted', 0, 1] } }, avgScore: { $avg: '$weightedScore' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'judge' } },
      { $unwind: '$judge' },
      { $project: { _id: 0, judgeId: '$_id', judgeName: { $concat: ['$judge.firstName', ' ', '$judge.lastName'] }, email: '$judge.email', submitted: 1, pending: 1, avgScore: { $round: ['$avgScore', 2] } } },
      { $sort: { submitted: -1, pending: 1 } },
    ]);

    return successResponse(res, { data: { progress } });
  } catch (error) { next(error); }
};

const exportApplications = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const applications = await Application.find({})
      .populate('candidate', 'firstName lastName organization')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    if (format === 'pdf') {
      const lines = applications.map((app) => `${app.referenceNumber || 'N/A'} | ${app.projectTitle} | ${app.status} | ${app.averageScore?.toFixed(1) || '0'}`);
      const pdfBuffer = Buffer.from(buildSimplePdf('AI Awards Report', lines), 'utf8');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="ai-awards-report.pdf"');
      return res.send(pdfBuffer);
    }

    const csv = buildApplicationsCsv(applications);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-awards-report.csv"');
    return res.send(csv);
  } catch (error) { next(error); }
};

const publishFinalists = async (req, res, next) => {
  try {
    const { ids = [] } = req.body;
    const applications = await Application.find({ _id: { $in: ids } });
    await Promise.all(applications.map(async (app) => {
      app.status = APPLICATION_STATUS.FINALIST;
      app.publishedAsFinalist = true;
      app.publishedAsWinner = false;
      app.awardCitation = app.awardCitation || `${app.projectTitle} has been recognized as a finalist.`;
      await app.save();
    }));

    return successResponse(res, { message: 'Finalists published.', data: { count: applications.length } });
  } catch (error) { next(error); }
};

const publishWinners = async (req, res, next) => {
  try {
    const { ids = [] } = req.body;
    const applications = await Application.find({ _id: { $in: ids } });
    await Promise.all(applications.map(async (app, index) => {
      app.status = APPLICATION_STATUS.WINNER;
      app.publishedAsWinner = true;
      app.publishedAsFinalist = true;
      app.certificateNumber = app.certificateNumber || `CERT-${String(Date.now()).slice(-6)}-${String(index + 1).padStart(2, '0')}`;
      app.certificateIssuedAt = new Date();
      app.awardCitation = app.awardCitation || `${app.projectTitle} has been recognized as a winner.`;
      await app.save();
    }));

    return successResponse(res, { message: 'Winners published.', data: { count: applications.length } });
  } catch (error) { next(error); }
};

const generateCertificates = async (req, res, next) => {
  try {
    const { ids = [] } = req.body;
    const applications = await Application.find({ _id: { $in: ids } }).populate('candidate', 'firstName lastName organization');
    const generated = applications.map((app) => {
      app.certificateNumber = app.certificateNumber || `CERT-${String(Date.now()).slice(-6)}-${String(applications.indexOf(app) + 1).padStart(2, '0')}`;
      app.certificateIssuedAt = new Date();
      app.awardCitation = app.awardCitation || `${app.projectTitle} has been recognized for excellence.`;
      return app;
    });

    await Promise.all(generated.map((app) => app.save()));
    return successResponse(res, { message: 'Certificates generated.', data: { count: generated.length, certificates: generated.map((app) => ({ id: app._id, certificateNumber: app.certificateNumber, awardCitation: app.awardCitation })) } });
  } catch (error) { next(error); }
};

const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    await removeApplicationRecord({ application, performedBy: req.user._id, req });

    return successResponse(res, { message: 'Application deleted successfully.' });
  } catch (error) { next(error); }
};

const deleteApplicationByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    await removeApplicationRecord({ application, performedBy: req.user._id, req });

    return successResponse(res, { message: 'Application deleted successfully.' });
  } catch (error) { next(error); }
};

module.exports = {
  createApplication, updateApplication, submitApplication,
  getMyApplications, getApplicationById, getAllApplications,
  changeApplicationStatus, assignJudges, reviewEligibility,
  getMonitoringOverview, getJudgeProgress, exportApplications,
  publishFinalists, publishWinners, generateCertificates,
  uploadDocuments, deleteDocument, deleteApplication, deleteApplicationByAdmin,
};
