const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require('../controllers/awardImageCategory.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (admin only)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  createCategory
);
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  updateCategory
);
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  deleteCategory
);
router.put(
  '/reorder',
  authenticate,
  requireRole('admin'),
  reorderCategories
);

module.exports = router;
