const Category = require('../models/Category.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AWARD_CATEGORIES } = require('../config/constants');
const logger = require('../utils/logger');

const DEPRECATED_CATEGORY_NAMES = [
  'Core National Awards',
  'Women in AI Leadership Award',
  'Innovation & Future-Focused Awards',
  'AI in Agriculture',
  'AI in Banking, Finance & Insurance',
  'AI in Healthcare & Life Sciences',
  'AI in Export Development',
  'AI in Education',
  'AI in Manufacturing & Industry 5.0',
  'AI in Media',
];

const buildSlug = (name) => name
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .trim();

const buildDefaultCategory = (name, index) => ({
  name,
  slug: buildSlug(name),
  description: `Applications for AI innovations in the ${name} sector. Submit groundbreaking solutions that leverage AI to transform this domain.`,
  shortDescription: `AI solutions transforming ${name.toLowerCase()}.`,
  isActive: true,
  order: index + 1,
  eligibilityQuestions: [
    { question: 'Does your solution use Artificial Intelligence or Machine Learning as a core component?', requiredAnswer: true },
    { question: 'Is your solution operational or in advanced prototype stage?', requiredAnswer: true },
    { question: 'Is the primary focus of your solution within this category?', requiredAnswer: true },
  ],
});

const buildDefaultCategoryInsert = (name, index) => {
  const {
    name: _name,
    slug: _slug,
    isActive,
    order,
    ...insertFields
  } = buildDefaultCategory(name, index);
  return insertFields;
};

const syncDefaultCategories = async () => {
  const operations = AWARD_CATEGORIES.map((name, index) => ({
    updateOne: {
      filter: { name },
      update: {
        $set: {
          slug: buildSlug(name),
          isActive: true,
          order: index + 1,
        },
        $setOnInsert: buildDefaultCategoryInsert(name, index),
      },
      upsert: true,
    },
  }));

  operations.push({
    updateMany: {
      filter: { name: { $in: DEPRECATED_CATEGORY_NAMES } },
      update: { $set: { isActive: false } },
    },
  });

  await Category.bulkWrite(operations);
};

// ── Get All Active Categories (Public) ─────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const [officialActiveCount, deprecatedActiveCount] = await Promise.all([
      Category.countDocuments({ name: { $in: AWARD_CATEGORIES }, isActive: true }),
      Category.countDocuments({ name: { $in: DEPRECATED_CATEGORY_NAMES }, isActive: true }),
    ]);

    if (officialActiveCount < AWARD_CATEGORIES.length || deprecatedActiveCount > 0) {
      await syncDefaultCategories();
    }

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
    await syncDefaultCategories();

    return successResponse(res, { message: `Synced ${AWARD_CATEGORIES.length} default award categories.` });
  } catch (error) { next(error); }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, seedDefaultCategories };
