const mongoose = require('mongoose');
const { MAIN_CATEGORIES_MAP } = require('../config/constants');
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
    const { status, stage = 'initial' } = req.query;
    const filter = {};
    if (stage === 'f2f') {
      filter.assignedJudgesF2F = req.user._id;
      filter.status = 'f2f_stage';
    } else {
      filter.assignedJudges = req.user._id;
      filter.status = { $ne: 'f2f_stage' };
      if (status) filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('category', 'name slug icon color')
      .populate('candidate', 'firstName lastName organization')
      .sort({ updatedAt: -1 });

    // Attach evaluation status for each application
    const withEvalStatus = await Promise.all(applications.map(async (app) => {
      const eval_ = await Evaluation.findOne({ application: app._id, judge: req.user._id, stage })
        .select('isSubmitted isDraft totalScore submittedAt weightedScore');
      return { ...app.toJSON(), myEvaluation: eval_ || null };
    }));

    return successResponse(res, { data: { applications: withEvalStatus } });
  } catch (error) { next(error); }
};

// ── Judge: Get / Create Evaluation for an Application ─────────────────────────
const getOrCreateEvaluation = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const stage = req.query.stage || 'initial';

    const checkQuery = { _id: applicationId };
    if (stage === 'f2f') {
      checkQuery.assignedJudgesF2F = req.user._id;
      checkQuery.status = 'f2f_stage';
    } else {
      checkQuery.assignedJudges = req.user._id;
    }

    const application = await Application.findOne(checkQuery)
      .populate('category', 'name evaluationCriteria')
      .populate('candidate', 'firstName lastName organization');

    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not found or not assigned to you.' });

    let evaluation = await Evaluation.findOne({ application: applicationId, judge: req.user._id, stage })
      .populate('scores.criteria');

    if (!evaluation) {
      evaluation = await Evaluation.create({ application: applicationId, judge: req.user._id, stage });
    }

    // Determine if this is an individual category
    const categoryDoc = await Category.findById(application.category?._id || application.category);
    const isIndividual = categoryDoc && INDIVIDUAL_CATEGORIES.includes(categoryDoc.name);
    const criteriaType = isIndividual ? 'individual' : 'organizational';

    // Get criteria matching the category type and stage
    const criteriaFilter = { isActive: true, stage: stage };
    if (criteriaType === 'individual') {
      criteriaFilter.criteriaType = 'individual';
    } else {
      criteriaFilter.criteriaType = 'organizational';
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
    const stage = req.query.stage || req.body.stage || 'initial';

    const checkQuery = { _id: applicationId };
    if (stage === 'f2f') {
      checkQuery.assignedJudgesF2F = req.user._id;
      checkQuery.status = 'f2f_stage';
    } else {
      checkQuery.assignedJudges = req.user._id;
    }

    const application = await Application.findOne(checkQuery);
    if (!application) return errorResponse(res, { statusCode: 404, message: 'Application not assigned to you.' });

    // Check if deadline has passed
    const activeDeadline = stage === 'f2f' ? application.deadlineF2F : application.deadline;
    if (activeDeadline && new Date(activeDeadline) < new Date()) {
      return errorResponse(res, { statusCode: 403, message: 'The evaluation deadline for this application has passed. Evaluations can no longer be submitted.' });
    }

    let evaluation = await Evaluation.findOne({ application: applicationId, judge: req.user._id, stage });
    if (!evaluation) evaluation = new Evaluation({ application: applicationId, judge: req.user._id, stage });

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
      const allEvals = await Evaluation.find({ application: applicationId, isSubmitted: true, stage });
      const totalWeighted = allEvals.reduce((s, e) => s + (e.weightedScore || 0), 0);
      if (stage === 'f2f') {
        application.averageScoreF2F = allEvals.length > 0 ? totalWeighted / allEvals.length : 0;
        application.evaluationCountF2F = allEvals.length;
      } else {
        application.averageScore = allEvals.length > 0 ? totalWeighted / allEvals.length : 0;
        application.evaluationCount = allEvals.length;
      }

      // Auto-allocate to initial stage on first evaluation submission
      if (stage === 'initial' && allEvals.length === 1) {
        application.status = 'initial_stage';
        application.statusHistory.push({
          status: 'initial_stage',
          changedBy: req.user._id,
          note: 'Auto-allocated to Initial Stage on first evaluation submission.',
          changedAt: new Date(),
        });
      }

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

    // Fetch initial stage assignments & evaluations
    const initialApps = await Application.find({ assignedJudges: judgeId, status: { $ne: 'f2f_stage' } })
      .populate('category', 'name')
      .select('projectTitle category status updatedAt submittedAt deadline');
    const initialEvals = await Evaluation.find({ judge: judgeId, stage: 'initial' });

    const initialTotal = initialApps.length;
    const initialCompleted = initialEvals.filter(e => e.isSubmitted).length;
    const initialPending = initialTotal - initialCompleted;
    const initialDrafted = initialEvals.filter(e => e.isDraft && !e.isSubmitted).length;
    
    const initialSubmittedEvals = initialEvals.filter(e => e.isSubmitted && e.weightedScore > 0);
    const initialAvgScore = initialSubmittedEvals.length > 0
      ? initialSubmittedEvals.reduce((s, e) => s + (e.weightedScore || 0), 0) / initialSubmittedEvals.length
      : 0;

    // Fetch f2f stage assignments & evaluations
    const f2fApps = await Application.find({ assignedJudgesF2F: judgeId, status: 'f2f_stage' })
      .populate('category', 'name')
      .select('projectTitle category status updatedAt submittedAt deadlineF2F');
    const f2fEvals = await Evaluation.find({ judge: judgeId, stage: 'f2f' });

    const f2fTotal = f2fApps.length;
    const f2fCompleted = f2fEvals.filter(e => e.isSubmitted).length;
    const f2fPending = f2fTotal - f2fCompleted;
    const f2fDrafted = f2fEvals.filter(e => e.isDraft && !e.isSubmitted).length;

    const f2fSubmittedEvals = f2fEvals.filter(e => e.isSubmitted && e.weightedScore > 0);
    const f2fAvgScore = f2fSubmittedEvals.length > 0
      ? f2fSubmittedEvals.reduce((s, e) => s + (e.weightedScore || 0), 0) / f2fSubmittedEvals.length
      : 0;

    // Deadlines
    // Find closest upcoming deadline for initial stage
    const initialUpcoming = initialApps
      .map(a => a.deadline)
      .filter(d => d && new Date(d) > new Date())
      .sort((a, b) => new Date(a) - new Date(b))[0] || null;

    // Find closest upcoming deadline for f2f stage
    const f2fUpcoming = f2fApps
      .map(a => a.deadlineF2F)
      .filter(d => d && new Date(d) > new Date())
      .sort((a, b) => new Date(a) - new Date(b))[0] || null;

    // Assigned categories (unique across both stages)
    const allApps = [...initialApps, ...f2fApps];
    const categories = [...new Map(
      allApps.map(a => [a.category?._id?.toString(), a.category?.name])
    ).entries()].map(([, name]) => name).filter(Boolean);

    // Recent activity combining both
    const combinedEvals = [...initialEvals, ...f2fEvals]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const recentActivity = await Promise.all(combinedEvals.slice(0, 5).map(async e => {
      const app = await Application.findById(e.application).select('projectTitle');
      return {
        applicationId: e.application,
        projectTitle: app?.projectTitle || 'Application',
        status: e.isSubmitted ? 'submitted' : e.isDraft ? 'draft' : 'not_started',
        score: e.weightedScore,
        stage: e.stage,
        updatedAt: e.updatedAt,
      };
    }));

    return successResponse(res, {
      data: {
        stats: {
          initial: { total: initialTotal, completed: initialCompleted, pending: initialPending, drafted: initialDrafted, avgScore: initialAvgScore, deadline: initialUpcoming },
          f2f: { total: f2fTotal, completed: f2fCompleted, pending: f2fPending, drafted: f2fDrafted, avgScore: f2fAvgScore, deadline: f2fUpcoming }
        },
        recentActivity,
        categories,
      },
    });
  } catch (error) { next(error); }
};

const getEvaluationTracker = async (req, res, next) => {
  try {
    const { stage = 'initial', mainCategory, subCategory, search } = req.query;

    const appFilter = { status: { $ne: 'draft' } };

    if (search) {
      appFilter.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (subCategory && subCategory !== 'all') {
      if (mongoose.Types.ObjectId.isValid(subCategory)) {
        appFilter.category = subCategory;
      } else {
        const cat = await Category.findOne({ name: subCategory });
        if (cat) {
          appFilter.category = cat._id;
        } else {
          appFilter.category = new mongoose.Types.ObjectId();
        }
      }
    } else if (mainCategory && mainCategory !== 'all') {
      const subCategoryNames = MAIN_CATEGORIES_MAP[mainCategory] || [];
      const cats = await Category.find({ name: { $in: subCategoryNames } });
      const catIds = cats.map(c => c._id);
      appFilter.category = { $in: catIds };
    }

    const apps = await Application.find(appFilter)
      .populate('candidate', 'firstName lastName email organization phone')
      .populate('category', 'name slug icon')
      .populate('assignedJudges', 'firstName lastName email')
      .populate('assignedJudgesF2F', 'firstName lastName email');

    const appIds = apps.map(a => a._id);

    const evaluations = await Evaluation.find({
      application: { $in: appIds },
      stage: stage
    }).populate('judge', 'firstName lastName email');

    const evalsByApp = {};
    evaluations.forEach(e => {
      const appIdStr = e.application.toString();
      if (!evalsByApp[appIdStr]) {
        evalsByApp[appIdStr] = [];
      }
      evalsByApp[appIdStr].push(e);
    });

    const results = apps.map(app => {
      const appEvals = evalsByApp[app._id.toString()] || [];
      const completedEvals = appEvals.filter(e => e.isSubmitted);

      let averageScore = null;
      if (completedEvals.length > 0) {
        const totalSum = completedEvals.reduce((sum, e) => sum + (e.totalScore || 0), 0);
        averageScore = totalSum / completedEvals.length;
      }

      const activeJudges = stage === 'f2f' ? (app.assignedJudgesF2F || []) : (app.assignedJudges || []);

      const allJudgeResults = activeJudges.map(judge => {
        const judgeEval = appEvals.find(e => e.judge?._id?.toString() === judge._id.toString());
        return {
          judgeId: judge._id,
          judgeName: `${judge.firstName} ${judge.lastName}`,
          email: judge.email,
          isSubmitted: judgeEval ? judgeEval.isSubmitted : false,
          submittedDate: judgeEval ? judgeEval.submittedAt : null,
          sectionScores: judgeEval ? judgeEval.scores : [],
          totalScore: judgeEval ? judgeEval.totalScore : null,
          remarks: judgeEval ? judgeEval.overallComments : ''
        };
      });

      const completedCount = completedEvals.length;
      const totalAssigned = activeJudges.length;
      let overallStatus = 'Pending';
      if (totalAssigned > 0) {
        if (completedCount === totalAssigned) {
          overallStatus = 'Completed';
        } else if (completedCount > 0) {
          overallStatus = 'In Progress';
        }
      }

      return {
        _id: app._id,
        projectTitle: app.projectTitle,
        referenceNumber: app.referenceNumber,
        stage: stage,
        mainCategory: mainCategory || 'all',
        subCategory: app.category?.name || '',
        category: app.category,
        candidate: app.candidate,
        assignedJudges: activeJudges,
        assignedJudgesF2F: app.assignedJudgesF2F || [],
        completedJudges: completedCount,
        averageScore: averageScore,
        round1Score: app.averageScore || 0,
        allJudgeResults: allJudgeResults,
        overallStatus: overallStatus,
        status: app.status
      };
    });

    const totalApplications = results.length;
    let totalCompletedReviews = 0;
    let totalPendingReviews = 0;
    let sumAverageScores = 0;
    let appsWithScoresCount = 0;
    let highestAverageScore = null;
    let lowestAverageScore = null;

    results.forEach(res => {
      const completed = res.completedJudges;
      const totalAssigned = res.assignedJudges.length;
      totalCompletedReviews += completed;
      totalPendingReviews += Math.max(0, totalAssigned - completed);

      if (res.averageScore !== null) {
        sumAverageScores += res.averageScore;
        appsWithScoresCount++;

        if (highestAverageScore === null || res.averageScore > highestAverageScore) {
          highestAverageScore = res.averageScore;
        }
        if (lowestAverageScore === null || res.averageScore < lowestAverageScore) {
          lowestAverageScore = res.averageScore;
        }
      }
    });

    const averageScoreOverall = appsWithScoresCount > 0 ? sumAverageScores / appsWithScoresCount : 0;

    const stats = {
      totalApplications,
      completedEvaluations: totalCompletedReviews,
      pendingEvaluations: totalPendingReviews,
      averageScore: averageScoreOverall,
      highestAverageScore: highestAverageScore !== null ? highestAverageScore : 0,
      lowestAverageScore: lowestAverageScore !== null ? lowestAverageScore : 0
    };

    return successResponse(res, {
      data: {
        applications: results,
        stats: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignedApplications,
  getOrCreateEvaluation,
  saveEvaluation,
  getEvaluationsByApplication,
  getJudgeDashboardStats,
  getEvaluationTracker
};
