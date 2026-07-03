const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getCategories, getCategoryById, createCategory,
  updateCategory, deleteCategory, seedDefaultCategories,
} = require('../controllers/category.controller');

// Public
router.get('/',     getCategories);
router.get('/:id', getCategoryById);

// Admin
router.post('/',        authenticate, requireRole('admin'), createCategory);
router.put('/:id',      authenticate, requireRole('admin'), updateCategory);
router.delete('/:id',   authenticate, requireRole('admin'), deleteCategory);
router.post('/seed',     authenticate, requireRole('admin'), seedDefaultCategories);

module.exports = router;
