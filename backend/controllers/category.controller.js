const Category = require('../models/Category.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AWARD_CATEGORIES } = require('../config/constants');
const logger = require('../utils/logger');

// ── Get All Active Categories (Public) ─────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('-evaluationCriteria');

    return successResponse(res, { data: { categories } });
  } catch (error) { next(error); }
};

// ── Get Single Category ─────────────────────────────────────────────────────────
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('evaluationCriteria');
    if (!category) return errorResponse(res, { statusCode: 404, message: 'Category not found.' });
    return successResponse(res, { data: { category } });
  } catch (error) { next(error); }
};

// ── Admin: Create Category ──────────────────────────────────────────────────────
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    logger.info(`Category created: ${category.name}`);
    return successResponse(res, { statusCode: 201, message: 'Category created.', data: { category } });
  } catch (error) { next(error); }
};

// ── Admin: Update Category ──────────────────────────────────────────────────────
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return errorResponse(res, { statusCode: 404, message: 'Category not found.' });

    Object.assign(category, req.body);
    await category.save();

    return successResponse(res, { message: 'Category updated.', data: { category } });
  } catch (error) { next(error); }
};

// ── Admin: Delete Category ──────────────────────────────────────────────────────
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return errorResponse(res, { statusCode: 404, message: 'Category not found.' });
    logger.info(`Category deleted: ${category.name}`);
    return successResponse(res, { message: 'Category deleted.' });
  } catch (error) { next(error); }
};

// ── Admin: Seed Default Categories ─────────────────────────────────────────────
const seedDefaultCategories = async (req, res, next) => {
  try {
    const defaults = AWARD_CATEGORIES.map((name, i) => ({
      name,
      description: `Applications for AI innovations in the ${name} sector. Submit groundbreaking solutions that leverage AI to transform this domain.`,
      shortDescription: `AI solutions transforming ${name.toLowerCase()}.`,
      isActive: true,
      order: i + 1,
      eligibilityQuestions: [
        { question: 'Does your solution use Artificial Intelligence or Machine Learning as a core component?', requiredAnswer: true },
        { question: 'Is your solution operational or in advanced prototype stage?', requiredAnswer: true },
        { question: 'Is the primary focus of your solution within this category?', requiredAnswer: true },
      ],
    }));

    let created = 0;
    for (const cat of defaults) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        created++;
      }
    }

    return successResponse(res, { message: `Seeded ${created} new categories (${defaults.length - created} already existed).` });
  } catch (error) { next(error); }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, seedDefaultCategories };
