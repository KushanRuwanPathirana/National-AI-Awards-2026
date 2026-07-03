const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  createApplication, updateApplication, submitApplication,
  getMyApplications, getApplicationById, getAllApplications,
  changeApplicationStatus, assignJudges,
  uploadDocuments, deleteDocument,
} = require('../controllers/application.controller');

// ── Multer Config ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/documents'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
  },
});

// Candidate
router.post('/',                  authenticate, requireRole('candidate'), createApplication);
router.get('/my',                 authenticate, requireRole('candidate'), getMyApplications);
router.put('/:id',                authenticate, requireRole('candidate'), updateApplication);
router.post('/:id/submit',        authenticate, requireRole('candidate'), submitApplication);
router.post('/:id/documents',     authenticate, requireRole('candidate'), upload.array('documents', 5), uploadDocuments);
router.delete('/:id/documents/:docId', authenticate, requireRole('candidate'), deleteDocument);

// Admin
router.get('/',                   authenticate, requireRole('admin'), getAllApplications);
router.patch('/:id/status',       authenticate, requireRole('admin'), changeApplicationStatus);
router.patch('/:id/assign-judges', authenticate, requireRole('admin'), assignJudges);

// Shared (admin/judge/candidate own)
router.get('/:id',                authenticate, getApplicationById);

module.exports = router;
