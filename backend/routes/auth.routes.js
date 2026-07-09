const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  updateProfileImage,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const upload = require('../middleware/upload.middleware');

// Optional authentication middleware for verify/resend OTP (reads headers if available)
const optionalAuthenticate = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
  } catch (err) {
    // Suppress error so request is still processed as guest
  }
  next();
};

// @route   POST /api/auth/register
router.post('/register', registerValidator, register);

// @route   POST /api/auth/login
router.post('/login', loginValidator, login);

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', optionalAuthenticate, verifyOTP);

// @route   POST /api/auth/resend-otp
router.post('/resend-otp', optionalAuthenticate, resendOTP);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// @route   POST /api/auth/change-password
router.post('/change-password', authenticate, changePassword);

// @route   PATCH /api/auth/profile
router.patch('/profile', authenticate, updateProfile);

// @route   POST /api/auth/profile-image
router.post('/profile-image', authenticate, (req, res, next) => {
  req.uploadSubDir = 'profiles';
  next();
}, upload.single('profileImage'), updateProfileImage);

// @route   GET /api/auth/me
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
router.post('/logout', authenticate, logout);

module.exports = router;
