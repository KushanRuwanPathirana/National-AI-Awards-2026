const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const contactRoutes = require('./contact.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Awards Sri Lanka API is running ✅',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
