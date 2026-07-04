const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { getCriteria, getCriteriaById, createCriteria, updateCriteria, deleteCriteria } = require('../controllers/evaluationCriteria.controller');

router.get('/', getCriteria);
router.get('/:id', getCriteriaById);
router.post('/', authenticate, requireRole('admin'), createCriteria);
router.put('/:id', authenticate, requireRole('admin'), updateCriteria);
router.delete('/:id', authenticate, requireRole('admin'), deleteCriteria);

module.exports = router;
