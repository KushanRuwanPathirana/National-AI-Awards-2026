const EvaluationCriteria = require('../models/EvaluationCriteria.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ── Default Criteria Definitions ──────────────────────────────────────────────

const ORGANIZATIONAL_CRITERIA = [
  { name: 'Innovation & Originality', weight: 20, description: 'Novelty of the AI solution, creativity, and uniqueness compared to existing approaches.', order: 1 },
  { name: 'Measurable Impact', weight: 25, description: 'Demonstrated business, societal, or national impact supported by measurable outcomes, KPIs, revenue or evidence.', order: 2 },
  { name: 'Technical Excellence', weight: 20, description: 'AI architecture, technical implementation, robustness, performance, and engineering quality.', order: 3 },
  { name: 'Responsible AI & Governance', weight: 15, description: 'Ethical AI practices, transparency, fairness, privacy, security, and regulatory compliance.', order: 4 },
  { name: 'Scalability & Sustainability', weight: 10, description: 'Ability to scale, long-term viability, maintainability, and adaptability.', order: 5 },
  { name: 'Execution & Evidence', weight: 10, description: 'Quality of implementation, supporting documentation, demonstrations, customer validation, and measurable proof.', order: 6 },
];

const INDIVIDUAL_CRITERIA = [
  { name: 'Strategic AI Vision & Leadership', weight: 25, description: 'Evidence that the leader has developed and championed an AI strategy, secured executive sponsorship, positioned AI as a strategic capability, and created an AI-enabled culture.', order: 1 },
  { name: 'Business & Societal Impact', weight: 25, description: 'Demonstrated measurable outcomes through AI.', order: 2 },
  { name: 'Responsible AI Leadership', weight: 15, description: 'Leadership in AI governance, data governance, ethics, risk management, and regulatory compliance.', order: 3 },
  { name: 'Innovation & Thought Leadership', weight: 15, description: 'Contribution to advancing AI practice.', order: 4 },
  { name: 'Talent & Workforce Development', weight: 10, description: 'Investment in capability building.', order: 5 },
  { name: 'Ecosystem & National Contribution', weight: 10, description: 'Contribution beyond the organization.', order: 6 },
];

const getCriteria = async (req, res, next) => {
  try {
    const { category, active, criteriaType } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === 'true';
    if (criteriaType) filter.criteriaType = criteriaType;

    const criteria = await EvaluationCriteria.find(filter).populate('category', 'name').sort({ order: 1, name: 1 });
    return successResponse(res, { data: { criteria } });
  } catch (error) { next(error); }
};

const getCriteriaById = async (req, res, next) => {
  try {
    const item = await EvaluationCriteria.findById(req.params.id).populate('category', 'name');
    if (!item) return errorResponse(res, { statusCode: 404, message: 'Evaluation criterion not found.' });
    return successResponse(res, { data: { criterion: item } });
  } catch (error) { next(error); }
};

const createCriteria = async (req, res, next) => {
  try {
    const item = await EvaluationCriteria.create(req.body);
    return successResponse(res, { statusCode: 201, message: 'Evaluation criterion created.', data: { criterion: item } });
  } catch (error) { next(error); }
};

const updateCriteria = async (req, res, next) => {
  try {
    const item = await EvaluationCriteria.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return errorResponse(res, { statusCode: 404, message: 'Evaluation criterion not found.' });
    return successResponse(res, { message: 'Evaluation criterion updated.', data: { criterion: item } });
  } catch (error) { next(error); }
};

const deleteCriteria = async (req, res, next) => {
  try {
    const item = await EvaluationCriteria.findByIdAndDelete(req.params.id);
    if (!item) return errorResponse(res, { statusCode: 404, message: 'Evaluation criterion not found.' });
    return successResponse(res, { message: 'Evaluation criterion deleted.' });
  } catch (error) { next(error); }
};

// ── Seed Default Criteria ─────────────────────────────────────────────────────
const seedDefaultCriteria = async (req, res, next) => {
  try {
    let created = 0;

    // Seed organizational criteria
    for (const c of ORGANIZATIONAL_CRITERIA) {
      const exists = await EvaluationCriteria.findOne({ name: c.name, criteriaType: 'organizational' });
      if (!exists) {
        await EvaluationCriteria.create({ ...c, criteriaType: 'organizational', isActive: true });
        created++;
      }
    }

    // Seed individual criteria
    for (const c of INDIVIDUAL_CRITERIA) {
      const exists = await EvaluationCriteria.findOne({ name: c.name, criteriaType: 'individual' });
      if (!exists) {
        await EvaluationCriteria.create({ ...c, criteriaType: 'individual', isActive: true });
        created++;
      }
    }

    return successResponse(res, { message: `Seeded ${created} new evaluation criteria. (${ORGANIZATIONAL_CRITERIA.length} organizational + ${INDIVIDUAL_CRITERIA.length} individual defined)` });
  } catch (error) { next(error); }
};

module.exports = { getCriteria, getCriteriaById, createCriteria, updateCriteria, deleteCriteria, seedDefaultCriteria };
