const express = require("express");
const router = express.Router();

const authRoutes         = require('./auth.routes');
const contactRoutes      = require('./contact.routes');
const applicationRoutes  = require('./application.routes');
const categoryRoutes     = require('./category.routes');
const evaluationRoutes   = require('./evaluation.routes');
const evaluationCriteriaRoutes = require('./evaluationCriteria.routes');
const contentRoutes      = require('./content.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes        = require('./admin.routes');
const judgeRoutes        = require('./judge.routes');

// Mount routes
router.use('/auth',          authRoutes);
router.use('/contact',       contactRoutes);
router.use('/applications',  applicationRoutes);
router.use('/categories',    categoryRoutes);
router.use('/evaluations',   evaluationRoutes);
router.use('/evaluation-criteria', evaluationCriteriaRoutes);
router.use('/content',       contentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin',         adminRoutes);
router.use('/judges',        judgeRoutes);
router.use('/payment',       require('./payment.routes'));
// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Awards Sri Lanka API is running ✅",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
