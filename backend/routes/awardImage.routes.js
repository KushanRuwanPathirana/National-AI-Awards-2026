const express = require('express');
const router = express.Router();
const {
  getAllImages,
  getHomepageImages,
  getImageById,
  uploadImage,
  uploadMultipleImages,
  updateImage,
  deleteImage,
  reorderImages,
} = require('../controllers/awardImage.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { uploadAwardImages } = require('../middleware/upload.middleware');

// Public routes
router.get('/homepage', getHomepageImages);
router.get('/', getAllImages);
router.get('/:id', getImageById);

// Protected routes (admin only)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  uploadAwardImages.single('image'),
  uploadImage
);
router.post(
  '/upload-multiple',
  authenticate,
  requireRole('admin'),
  uploadAwardImages.array('images', 10),
  uploadMultipleImages
);
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  uploadAwardImages.single('image'),
  updateImage
);
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  deleteImage
);
router.put(
  '/reorder',
  authenticate,
  requireRole('admin'),
  reorderImages
);

module.exports = router;
