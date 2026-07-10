const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { APPLICATION_DEADLINE } = require('../config/constants');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  createApplication, updateApplication, submitApplication,
  getMyApplications, getApplicationById, getAllApplications,
  changeApplicationStatus, assignJudges, assignJudgesF2F, autoAssignJudges, reviewEligibility,
  getMonitoringOverview, getJudgeProgress, exportApplications,
  publishFinalists, publishWinners, generateCertificates,
  uploadDocuments, deleteDocument, deleteApplication, deleteApplicationByAdmin,
  downloadDocument, uploadPaymentSlip, deletePaymentSlip, updateApplicationDeadline, updateApplicationDeadlineF2F,
} = require('../controllers/application.controller');

// ── Multer Config ──────────────────────────────────────────────────────────────
const documentsUploadDir = path.join(__dirname, '../uploads/documents');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(documentsUploadDir, { recursive: true });
    cb(null, documentsUploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${path.basename(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else {
      const error = new Error('Invalid file type. Only PDF documents are allowed.');
      error.statusCode = 400;
      cb(error);
    }
  },
});

const uploadSlip = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else {
      const error = new Error('Invalid file type. Only PDF and JPEG/PNG/WebP images are allowed.');
      error.statusCode = 400;
      cb(error);
    }
  },
});

const rejectAfterApplicationDeadline = (req, res, next) => {
  if (Date.now() < new Date(APPLICATION_DEADLINE.CLOSES_AT).getTime()) return next();
  return res.status(403).json({
    success: false,
    message: `Applications can no longer be created, edited, or submitted after the ${APPLICATION_DEADLINE.DISPLAY_DATE} deadline.`,
  });
};

// Candidate
router.post('/',                  authenticate, requireRole('candidate'), createApplication);
router.get('/my',                 authenticate, requireRole('candidate'), getMyApplications);
router.put('/:id',                authenticate, requireRole('candidate'), updateApplication);
router.post('/:id/submit',        authenticate, requireRole('candidate'), submitApplication);
router.post('/:id/documents',     authenticate, requireRole('candidate'), rejectAfterApplicationDeadline, upload.array('documents', 2), uploadDocuments);
router.delete('/:id/documents/:docId', authenticate, requireRole('candidate'), deleteDocument);
router.post('/:id/payment-slip',  authenticate, requireRole('candidate'), rejectAfterApplicationDeadline, uploadSlip.single('paymentSlip'), uploadPaymentSlip);
router.delete('/:id/payment-slip', authenticate, requireRole('candidate'), deletePaymentSlip);
router.delete('/:id',             authenticate, requireRole('candidate'), deleteApplication);

// Admin
router.get('/',                   authenticate, requireRole('admin'), getAllApplications);
router.get('/monitoring',        authenticate, requireRole('admin'), getMonitoringOverview);
router.get('/judge-progress',    authenticate, requireRole('admin'), getJudgeProgress);
router.get('/export',            authenticate, requireRole('admin'), exportApplications);
router.post('/publish-finalists', authenticate, requireRole('admin'), publishFinalists);
router.post('/publish-winners',  authenticate, requireRole('admin'), publishWinners);
router.post('/generate-certificates', authenticate, requireRole('admin'), generateCertificates);
router.patch('/:id/status',       authenticate, requireRole('admin'), changeApplicationStatus);
router.patch('/:id/assign-judges', authenticate, requireRole('admin'), assignJudges);
router.patch('/:id/assign-judges-f2f', authenticate, requireRole('admin'), assignJudgesF2F);
router.patch('/:id/auto-assign-judges', authenticate, requireRole('admin'), autoAssignJudges);
router.patch('/:id/review-eligibility', authenticate, requireRole('admin'), reviewEligibility);
router.patch('/:id/deadline',     authenticate, requireRole('admin'), updateApplicationDeadline);
router.patch('/:id/deadline-f2f', authenticate, requireRole('admin'), updateApplicationDeadlineF2F);
router.delete('/admin/:id',       authenticate, requireRole('admin'), deleteApplicationByAdmin);

// Shared (admin/judge/candidate own)
router.get('/:id',                authenticate, getApplicationById);
router.get('/:id/documents/:docId/download', authenticate, downloadDocument);

module.exports = router;
