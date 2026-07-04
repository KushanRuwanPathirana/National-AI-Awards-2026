const EvaluationCriteria = require('../models/EvaluationCriteria.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getCriteria = async (req, res, next) => {
  try {
    const { category, active } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === 'true';

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

module.exports = { getCriteria, getCriteriaById, createCriteria, updateCriteria, deleteCriteria };
