const AwardImageCategory = require('../models/AwardImageCategory.model');
const AwardImage = require('../models/AwardImage.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── Get All Categories ───────────────────────────────────────────────────────────
const getAllCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const categories = await AwardImageCategory.find(filter)
      .sort({ displayOrder: 1, name: 1 });

    return successResponse(res, {
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Category by ID ───────────────────────────────────────────────────────────
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await AwardImageCategory.findById(id);

    if (!category) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Category not found.',
      });
    }

    return successResponse(res, { data: { category } });
  } catch (error) {
    next(error);
  }
};

// ── Create Category ───────────────────────────────────────────────────────────────
const createCategory = async (req, res, next) => {
  try {
    const { name, displayOrder, status } = req.body;

    if (!name) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Category name is required.',
      });
    }

    const category = await AwardImageCategory.create({
      name,
      displayOrder: displayOrder || 0,
      status: status || 'active',
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Category name already exists.',
      });
    }
    next(error);
  }
};

// ── Update Category ───────────────────────────────────────────────────────────────
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, displayOrder, status } = req.body;

    const category = await AwardImageCategory.findById(id);
    if (!category) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Category not found.',
      });
    }

    if (name) category.name = name;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (status) category.status = status;

    await category.save();

    return successResponse(res, {
      message: 'Category updated successfully.',
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Category name already exists.',
      });
    }
    next(error);
  }
};

// ── Delete Category ───────────────────────────────────────────────────────────────
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { moveToCategoryId } = req.body;

    const category = await AwardImageCategory.findById(id);
    if (!category) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Category not found.',
      });
    }

    // Check if category has images
    const imageCount = await AwardImage.countDocuments({ categoryId: id });
    
    if (imageCount > 0) {
      if (!moveToCategoryId) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Category has ${imageCount} image(s). Please specify a category to move them to.`,
        });
      }

      // Verify the target category exists
      const targetCategory = await AwardImageCategory.findById(moveToCategoryId);
      if (!targetCategory) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'Target category not found.',
        });
      }

      // Move images to target category
      await AwardImage.updateMany(
        { categoryId: id },
        { categoryId: moveToCategoryId }
      );
    }

    await AwardImageCategory.deleteOne({ _id: id });

    return successResponse(res, {
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ── Reorder Categories ────────────────────────────────────────────────────────────
const reorderCategories = async (req, res, next) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Categories array is required.',
      });
    }

    const updatePromises = categories.map(({ id, displayOrder }) =>
      AwardImageCategory.findByIdAndUpdate(id, { displayOrder })
    );

    await Promise.all(updatePromises);

    return successResponse(res, {
      message: 'Categories reordered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
