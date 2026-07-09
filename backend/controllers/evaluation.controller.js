const Evaluation = require('../models/Evaluation.model');
const Application = require('../models/Application.model');
const EvaluationCriteria = require('../models/EvaluationCriteria.model');
const Category = require('../models/Category.model');
const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { INDIVIDUAL_CATEGORIES } = require('../config/constants');
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

    // Determine if this is an individual category
    const categoryDoc = await Category.findById(application.category?._id || application.category);
    const isIndividual = categoryDoc && INDIVIDUAL_CATEGORIES.includes(categoryDoc.name);
    const criteriaType = isIndividual ? 'individual' : 'organizational';

    // Get criteria matching the category type
    // For organizational: also match criteria without criteriaType set (backward compat)
    const criteriaFilter = { isActive: true };
    if (criteriaType === 'individual') {
      criteriaFilter.criteriaType = 'individual';
    } else {
      criteriaFilter.$or = [{ criteriaType: 'organizational' }, { criteriaType: { $exists: false } }, { criteriaType: null }];
    }
    const criteria = await EvaluationCriteria.find(criteriaFilter).sort({ order: 1 });

    return successResponse(res, { data: { application, evaluation, criteria, criteriaType } });
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

    // Calculate scores (marks = weight %, total always 100)
    if (scores && scores.length > 0) {
      evaluation.totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      const maxPossible = 100; // weights sum to 100
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

// ── Judge: Dashboard Stats ─────────────────────────────────────────────────────
const getJudgeDashboardStats = async (req, res, next) => {
  try {
    const judgeId = req.user._id;

    // Fetch all assigned applications
    const applications = await Application.find({ assignedJudges: judgeId })
      .populate('category', 'name')
      .sort({ updatedAt: -1 })
      .select('projectTitle category status updatedAt submittedAt');

    // Fetch all evaluations by this judge
    const evaluations = await Evaluation.find({ judge: judgeId })
      .populate('application', 'projectTitle')
      .sort({ updatedAt: -1 });

    const total = applications.length;
    const completed = evaluations.filter(e => e.isSubmitted).length;
    const drafted = evaluations.filter(e => e.isDraft && !e.isSubmitted).length;
    const pending = total - completed;

    const submittedEvals = evaluations.filter(e => e.isSubmitted && e.weightedScore > 0);
    const avgScore =
      submittedEvals.length > 0
        ? submittedEvals.reduce((s, e) => s + (e.weightedScore || 0), 0) / submittedEvals.length
        : 0;

    // Recent activity: last 5 touched evaluations
    const recentActivity = evaluations.slice(0, 5).map(e => ({
      applicationId: e.application?._id,
      projectTitle: e.application?.projectTitle,
      status: e.isSubmitted ? 'submitted' : e.isDraft ? 'draft' : 'not_started',
      score: e.weightedScore,
      updatedAt: e.updatedAt,
    }));

    // Assigned categories (unique)
    const categories = [...new Map(
      applications.map(a => [a.category?._id?.toString(), a.category?.name])
    ).entries()].map(([, name]) => name).filter(Boolean);

    return successResponse(res, {
      data: {
        stats: { total, completed, pending, drafted, avgScore },
        recentActivity,
        categories,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getAssignedApplications, getOrCreateEvaluation, saveEvaluation, getEvaluationsByApplication, getJudgeDashboardStats };
