const Evaluation = require('../models/Evaluation.model');
const Application = require('../models/Application.model');
const EvaluationCriteria = require('../models/EvaluationCriteria.model');
const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── Judge: Get Assigned Applications ──────────────────────────────────────────
const getAssignedApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { assignedJudges: req.user._id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('category', 'name slug icon color')
      .populate('candidate', 'firstName lastName organization')
      .sort({ updatedAt: -1 });

    // Attach evaluation status for each application
    const withEvalStatus = await Promise.all(applications.map(async (app) => {
      const eval_ = await Evaluation.findOne({ application: app._id, judge: req.user._id }).select('isSubmitted isDraft totalScore submittedAt');
      return { ...app.toJSON(), myEvaluation: eval_ || null };
    }));

    return successResponse(res, { data: { applications: withEvalStatus } });
  } catch (error) { next(error); }
};

// ── Judge: Get / Create Evaluation for an Application ─────────────────────────
const getOrCreateEvaluation = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({ _id: applicationId, assignedJudges: req.user._id })
      .populate('category', 'name evaluationCriteria')
      .populate('candidate', 'firstName lastName organization');

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found or not assigned to you.' });

    let evaluation = await Evaluation.findOne({ application: applicationId, judge: req.user._id })
      .populate('scores.criteria');

    if (!evaluation) {
      evaluation = await Evaluation.create({ application: applicationId, judge: req.user._id });
    }

    // Get criteria for the category
    const criteria = await EvaluationCriteria.find({ isActive: true }).sort({ order: 1 });

    return successResponse(res, { data: { application, evaluation, criteria } });
  } catch (error) { next(error); }
};

// ── Judge: Save / Submit Evaluation ────────────────────────────────────────────
const saveEvaluation = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { scores, overallComments, strengths, weaknesses, recommendation, confidentialityAccepted, submit } = req.body;

    const application = await Application.findOne({ _id: applicationId, assignedJudges: req.user._id });
    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not assigned to you.' });

    let evaluation = await Evaluation.findOne({ application: applicationId, judge: req.user._id });
    if (!evaluation) evaluation = new Evaluation({ application: applicationId, judge: req.user._id });

    if (evaluation.isSubmitted) {
      return errorResponse(res, { statusCode: 400, message: 'Evaluation already submitted and cannot be modified.' });
    }

    if (scores) evaluation.scores = scores;
    if (overallComments !== undefined) evaluation.overallComments = overallComments;
    if (strengths !== undefined) evaluation.strengths = strengths;
    if (weaknesses !== undefined) evaluation.weaknesses = weaknesses;
    if (recommendation !== undefined) evaluation.recommendation = recommendation;
    if (confidentialityAccepted !== undefined) evaluation.confidentialityAccepted = confidentialityAccepted;

    // Calculate scores
    if (scores && scores.length > 0) {
      evaluation.totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      const maxPossible = scores.length * 10;
      evaluation.weightedScore = maxPossible > 0 ? (evaluation.totalScore / maxPossible) * 100 : 0;
    }

    if (submit) {
      if (!confidentialityAccepted && !evaluation.confidentialityAccepted) {
        return errorResponse(res, { statusCode: 400, message: 'You must accept the confidentiality declaration.' });
      }
      evaluation.isSubmitted = true;
      evaluation.isDraft = false;
      evaluation.submittedAt = new Date();
      await evaluation.save();

      // Update application's average score
      const allEvals = await Evaluation.find({ application: applicationId, isSubmitted: true });
      const totalWeighted = allEvals.reduce((s, e) => s + (e.weightedScore || 0), 0);
      application.averageScore = allEvals.length > 0 ? totalWeighted / allEvals.length : 0;
      application.evaluationCount = allEvals.length;
      await application.save({ validateBeforeSave: false });

      // Notify admin
      try {
        await Notification.create({
          recipient: application.candidate,
          type: 'evaluation_submitted',
          title: 'Your application has been evaluated',
          message: `A judge has submitted their evaluation for "${application.projectTitle}".`,
          link: `/dashboard/applications/${application._id}`,
          relatedApplication: application._id,
        });
      } catch (notificationError) {
        logger.error(`Evaluation notification failed: ${notificationError.message}`);
      }
    } else {
      evaluation.isDraft = true;
      await evaluation.save();
    }

    return successResponse(res, { message: submit ? 'Evaluation submitted!' : 'Evaluation saved as draft.', data: { evaluation } });
  } catch (error) { next(error); }
};

// ── Admin: Get All Evaluations for Application ─────────────────────────────────
const getEvaluationsByApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const evaluations = await Evaluation.find({ application: applicationId })
      .populate('judge', 'firstName lastName email')
      .populate('scores.criteria', 'name weight')
      .sort({ submittedAt: -1 });

    return successResponse(res, { data: { evaluations } });
  } catch (error) { next(error); }
};

module.exports = { getAssignedApplications, getOrCreateEvaluation, saveEvaluation, getEvaluationsByApplication };
