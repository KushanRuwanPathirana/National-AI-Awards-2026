const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { getContent, getContentById, createContent, updateContent, deleteContent } = require('../controllers/content.controller');

router.get('/', getContent);
router.get('/:id', getContentById);
router.post('/', authenticate, requireRole('admin'), createContent);
router.put('/:id', authenticate, requireRole('admin'), updateContent);
router.delete('/:id', authenticate, requireRole('admin'), deleteContent);

module.exports = router;
