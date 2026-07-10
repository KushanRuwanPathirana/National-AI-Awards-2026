const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const {
  getJudges,
  getJudgeById,
  createJudge,
  updateJudge,
  uploadJudgePhoto,
  deleteJudge,
  sendWelcomeToAllJudges,
} = require('../controllers/judge.controller');

// Public routes
router.get('/', getJudges);
router.get('/:id', getJudgeById);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), createJudge);
router.post('/send-welcome', authenticate, requireRole('admin'), sendWelcomeToAllJudges);
router.put('/:id', authenticate, requireRole('admin'), updateJudge);

router.patch(
  '/:id/photo',
  authenticate,
  requireRole('admin'),
  (req, res, next) => {
    req.uploadSubDir = 'judges';
    next();
  },
  upload.single('photo'),
  uploadJudgePhoto
);

router.delete('/:id', authenticate, requireRole('admin'), deleteJudge);

module.exports = router;
