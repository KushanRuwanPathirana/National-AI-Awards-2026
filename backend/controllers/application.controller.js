const Application = require('../models/Application.model');
const Category = require('../models/Category.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { APPLICATION_STATUS, ALLOWED_TRANSITIONS } = require('../config/constants');
const { sendApplicationStatusUpdate } = require('../services/email.service');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Create Draft ───────────────────────────────────────────────────────────────
const createApplication = async (req, res, next) => {
  try {
    const { categoryId, projectTitle, tagline } = req.body;

    if (!categoryId || !projectTitle) {
      return errorResponse(res, { statusCode: 400, message: 'Category and project title are required.' });
    }

    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
      return errorResponse(res, { statusCode: 404, message: 'Category not found or inactive.' });
    }

    const application = await Application.create({
      candidate: req.user._id,
      category: categoryId,
      projectTitle,
      tagline,
      status: APPLICATION_STATUS.DRAFT,
      completedStep: 1,
      statusHistory: [{ status: APPLICATION_STATUS.DRAFT, changedBy: req.user._id, note: 'Application created' }],
    });

    await createAuditLog({ action: 'application_created', performedBy: req.user._id, targetId: application._id, description: `New draft: ${projectTitle}`, req });

    return successResponse(res, { statusCode: 201, message: 'Application draft created.', data: { application } });
  } catch (error) { next(error); }
};

// ── Update Draft (multi-step) ──────────────────────────────────────────────────
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Only draft applications can be edited.' });
    }

    const allowedFields = [
      'projectTitle', 'tagline', 'eligibilityAnswers', 'isEligible',
      'problemStatement', 'solution', 'aiTechnologies', 'innovationDetails',
      'impactDetails', 'teamSize', 'teamMembers', 'projectUrl', 'organizationName',
      'projectStartYear', 'declarationAccepted', 'declarationDate', 'completedStep',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) application[field] = req.body[field];
    });

    await application.save();
    return successResponse(res, { message: 'Application updated.', data: { application } });
  } catch (error) { next(error); }
};

// ── Submit Application ─────────────────────────────────────────────────────────
const submitApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id }).populate('category');

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Only draft applications can be submitted.' });
    }
    if (!application.declarationAccepted) {
      return errorResponse(res, { statusCode: 400, message: 'You must accept the declaration before submitting.' });
    }
    if (!application.problemStatement || !application.solution) {
      return errorResponse(res, { statusCode: 400, message: 'Please complete all required form fields before submitting.' });
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
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });
    if (application.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, { statusCode: 400, message: 'Documents can only be uploaded to draft applications.' });
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, { statusCode: 400, message: 'No files uploaded.' });
    }

    const newDocs = req.files.map(f => ({
      fieldName: f.fieldname,
      originalName: f.originalname,
      filePath: f.path.replace(/\\/g, '/'),
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
    const { id, docId } = req.params;
    const application = await Application.findOne({ _id: id, candidate: req.user._id });

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found.' });

    const docIndex = application.documents.findIndex(d => d._id.toString() === docId);
    if (docIndex === -1) return errorResponse(res, { statusCode: 404, message: 'Document not found.' });

    const doc = application.documents[docIndex];
    // Remove file from disk
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    application.documents.splice(docIndex, 1);
    await application.save();

    return successResponse(res, { message: 'Document deleted.' });
  } catch (error) { next(error); }
};

module.exports = {
  createApplication, updateApplication, submitApplication,
  getMyApplications, getApplicationById, getAllApplications,
  changeApplicationStatus, assignJudges,
  uploadDocuments, deleteDocument,
};
