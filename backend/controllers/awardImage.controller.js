const AwardImage = require('../models/AwardImage.model');
const AwardImageCategory = require('../models/AwardImageCategory.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// ── Helpers ────────────────────────────────────────────────────────────────────
const resolveStoredFilePath = (filePath) => {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, "/");
  if (path.isAbsolute(normalized)) return normalized;
  return path.join(__dirname, "..", normalized);
};

const getPublicUploadPath = (file) =>
  path.posix.join("uploads", "award-images", file.filename);

// ── Get All Images ─────────────────────────────────────────────────────────────
const getAllImages = async (req, res, next) => {
  try {
    const {
      category,
      eventYear,
      status,
      featured,
      page = 1,
      limit = 20,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.query;

    const filter = {};
    if (category) filter.categoryId = category;
    if (eventYear) filter.eventYear = parseInt(eventYear);
    if (status) filter.status = status;
    if (featured === 'true') filter.featuredOnHomepage = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [images, total] = await Promise.all([
      AwardImage.find(filter)
        .populate('categoryId', 'name slug')
        .populate('uploadedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      AwardImage.countDocuments(filter),
    ]);

    return successResponse(res, {
      data: {
        images,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Homepage Images ─────────────────────────────────────────────────────────
const getHomepageImages = async (req, res, next) => {
  try {
    const { limit = 12 } = req.query;

    const images = await AwardImage.find({
      featuredOnHomepage: true,
      status: 'active',
    })
      .populate('categoryId', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));

    return successResponse(res, { data: { images } });
  } catch (error) {
    next(error);
  }
};

// ── Get Image by ID ────────────────────────────────────────────────────────────
const getImageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const image = await AwardImage.findById(id)
      .populate('categoryId', 'name slug')
      .populate('uploadedBy', 'firstName lastName');

    if (!image) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Image not found.',
      });
    }

    return successResponse(res, { data: { image } });
  } catch (error) {
    next(error);
  }
};

// ── Upload Image ───────────────────────────────────────────────────────────────
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'No file uploaded.',
      });
    }

    const {
      title,
      caption,
      categoryId,
      eventYear,
      featuredOnHomepage,
      displayOrder,
      altText,
      status,
    } = req.body;

    if (!title) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Image title is required.',
      });
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await AwardImageCategory.findById(categoryId);
      if (!category) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'Category not found.',
        });
      }
    }

    const image = await AwardImage.create({
      title,
      caption,
      imageUrl: getPublicUploadPath(req.file),
      thumbnailUrl: getPublicUploadPath(req.file), // Using same file for now
      categoryId: categoryId || null,
      eventYear: eventYear ? parseInt(eventYear) : 2026,
      featuredOnHomepage: featuredOnHomepage === 'true' || featuredOnHomepage === true,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      altText: altText || title,
      status: status || 'active',
      uploadedBy: req.user._id,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Image uploaded successfully.',
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

// ── Upload Multiple Images ─────────────────────────────────────────────────────
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'No files uploaded.',
      });
    }

    const {
      categoryId,
      eventYear,
      featuredOnHomepage,
      status,
    } = req.body;

    // Verify category exists if provided
    if (categoryId) {
      const category = await AwardImageCategory.findById(categoryId);
      if (!category) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'Category not found.',
        });
      }
    }

    const images = await Promise.all(
      req.files.map((file, index) => {
        const title = req.body.titles ? req.body.titles[index] : file.originalname;
        const caption = req.body.captions ? req.body.captions[index] : '';
        
        return AwardImage.create({
          title,
          caption,
          imageUrl: getPublicUploadPath(file),
          thumbnailUrl: getPublicUploadPath(file),
          categoryId: categoryId || null,
          eventYear: eventYear ? parseInt(eventYear) : 2026,
          featuredOnHomepage: featuredOnHomepage === 'true' || featuredOnHomepage === true,
          displayOrder: index,
          altText: title,
          status: status || 'active',
          uploadedBy: req.user._id,
        });
      })
    );

    return successResponse(res, {
      statusCode: 201,
      message: `${images.length} image(s) uploaded successfully.`,
      data: { images },
    });
  } catch (error) {
    next(error);
  }
};

// ── Update Image ───────────────────────────────────────────────────────────────
const updateImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      caption,
      categoryId,
      eventYear,
      featuredOnHomepage,
      displayOrder,
      altText,
      status,
    } = req.body;

    const image = await AwardImage.findById(id);
    if (!image) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Image not found.',
      });
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await AwardImageCategory.findById(categoryId);
      if (!category) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'Category not found.',
        });
      }
    }

    if (title) image.title = title;
    if (caption !== undefined) image.caption = caption;
    if (categoryId !== undefined) image.categoryId = categoryId || null;
    if (eventYear !== undefined) image.eventYear = parseInt(eventYear);
    if (featuredOnHomepage !== undefined) {
      image.featuredOnHomepage = featuredOnHomepage === 'true' || featuredOnHomepage === true;
    }
    if (displayOrder !== undefined) image.displayOrder = parseInt(displayOrder);
    if (altText !== undefined) image.altText = altText;
    if (status !== undefined) image.status = status;

    // Handle new file upload
    if (req.file) {
      // Delete old image file
      const oldDiskPath = resolveStoredFilePath(image.imageUrl);
      if (oldDiskPath && fs.existsSync(oldDiskPath)) {
        try {
          fs.unlinkSync(oldDiskPath);
        } catch (e) {
          logger.error(`Failed to delete old image file: ${e.message}`);
        }
      }

      image.imageUrl = getPublicUploadPath(req.file);
      image.thumbnailUrl = getPublicUploadPath(req.file);
    }

    await image.save();

    const updatedImage = await AwardImage.findById(id)
      .populate('categoryId', 'name slug')
      .populate('uploadedBy', 'firstName lastName');

    return successResponse(res, {
      message: 'Image updated successfully.',
      data: { image: updatedImage },
    });
  } catch (error) {
    next(error);
  }
};

// ── Delete Image ───────────────────────────────────────────────────────────────
const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const image = await AwardImage.findById(id);

    if (!image) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Image not found.',
      });
    }

    // Delete image file from disk
    const diskPath = resolveStoredFilePath(image.imageUrl);
    if (diskPath && fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (e) {
        logger.error(`Failed to delete image file from disk: ${e.message}`);
      }
    }

    await AwardImage.deleteOne({ _id: id });

    return successResponse(res, {
      message: 'Image deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ── Reorder Images ────────────────────────────────────────────────────────────
const reorderImages = async (req, res, next) => {
  try {
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Images array is required.',
      });
    }

    const updatePromises = images.map(({ id, displayOrder }) =>
      AwardImage.findByIdAndUpdate(id, { displayOrder })
    );

    await Promise.all(updatePromises);

    return successResponse(res, {
      message: 'Images reordered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllImages,
  getHomepageImages,
  getImageById,
  uploadImage,
  uploadMultipleImages,
  updateImage,
  deleteImage,
  reorderImages,
};
