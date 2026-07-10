const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetOTPEmail,
  sendPasswordResetSuccessEmail,
  sendPasswordChangedEmail,
} = require('../services/email.service');
const logger = require('../utils/logger');

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper: generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user (generates verification OTP)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, { statusCode: 422, message: 'Validation failed', errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone, organization, designation } = req.body;

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, { statusCode: 409, message: 'An account with this email already exists.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'candidate',
      phone,
      organization,
      designation,
      otp,
      otpExpires,
      isEmailVerified: false,
    });

    await user.save();

    // Automatically assign matching applications to the registered judge
    await autoAssignApplicationsToJudge(user);

    // Send verification email
    try {
      await sendOTPEmail(user, otp);
      logger.info(`Verification OTP sent to: ${email}`);
    } catch (mailErr) {
      logger.error(`Error sending verification email to ${email}: ${mailErr.message}`);
      return errorResponse(res, {
        statusCode: 502,
        message: 'Account created, but the verification email could not be sent. Please try resending the OTP.',
      });
    }

    const token = generateToken(user);
    console.log('\n┌────────────────────────────────────────┐');
    console.log(`│  OTP CODE FOR: ${user.email.toUpperCase().padEnd(23)} │`);
    console.log(`│  CODE: ${otp.padEnd(31)} │`);
    console.log('└────────────────────────────────────────┘\n');
    logger.info(`New user registered: ${user.email} (${user.role}) - OTP generated: ${otp}`);

    return successResponse(res, {
      statusCode: 201,
      message: 'Account created successfully. Please verify your email with the OTP sent.',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-otp
// @access  Public (or authenticated)
const verifyOTP = async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    // 1. Identify user (either from auth session or email in body)
    let userEmail = email;
    if (req.user) {
      userEmail = req.user.email;
    }

    if (!otp) {
      return errorResponse(res, { statusCode: 400, message: 'OTP is required.' });
    }

    if (!userEmail) {
      return errorResponse(res, { statusCode: 400, message: 'Email is required for verification.' });
    }

    const user = await User.findOne({ email: userEmail }).select('+otp +otpExpires');
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return successResponse(res, { message: 'Email is already verified.', data: { user } });
    }

    if (user.otp !== otp) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid verification code.' });
    }

    if (new Date() > user.otpExpires) {
      return errorResponse(res, { statusCode: 400, message: 'Verification code has expired. Please request a new one.' });
    }

    // Update verified status
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Automatically assign matching applications to the registered judge
    await autoAssignApplicationsToJudge(user);

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (mailErr) {
      logger.error(`Error sending welcome email: ${mailErr.message}`);
    }

    logger.info(`Email verified successfully for: ${user.email}`);

    return successResponse(res, {
      statusCode: 200,
      message: 'Email verified successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public (or authenticated)
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    let userEmail = email;

    if (req.user) {
      userEmail = req.user.email;
    }

    if (!userEmail) {
      return errorResponse(res, { statusCode: 400, message: 'Email is required to resend OTP.' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return errorResponse(res, { statusCode: 400, message: 'Email is already verified.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    try {
      await sendOTPEmail(user, otp);
      console.log('\n┌────────────────────────────────────────┐');
      console.log(`│  OTP CODE RESENT FOR: ${userEmail.toUpperCase().padEnd(16)} │`);
      console.log(`│  CODE: ${otp.padEnd(31)} │`);
      console.log('└────────────────────────────────────────┘\n');
      logger.info(`Verification OTP resent to: ${userEmail} - OTP: ${otp}`);
    } catch (mailErr) {
      logger.error(`Error sending email to ${userEmail}: ${mailErr.message}`);
      return errorResponse(res, {
        statusCode: 502,
        message: 'Verification email could not be sent. Please check the email configuration and try again.',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, { statusCode: 422, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return errorResponse(res, { statusCode: 403, message: 'Your account has been deactivated.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    logger.info(`User logged in: ${user.email}`);

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful.',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (generates OTP, emails code)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, { statusCode: 400, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 for security, preventing account enumeration
      return successResponse(res, {
        message: 'If an account matches that email, a password reset OTP has been sent.',
      });
    }

    const resetOtp = generateOTP();
    user.passwordResetToken = resetOtp;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    try {
      await sendPasswordResetOTPEmail(user, resetOtp);
      logger.info(`Password reset OTP generated for: ${email}`);
    } catch (mailErr) {
      logger.error(`Error sending password reset OTP to ${email}: ${mailErr.message}`);
    }

    return successResponse(res, {
      message: 'If an account matches that email, a password reset OTP has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, token, password } = req.body;

    if (!password || (!token && (!email || !otp))) {
      return errorResponse(res, { statusCode: 400, message: 'Email, OTP, and new password are required.' });
    }

    if (password.length < 8) {
      return errorResponse(res, { statusCode: 400, message: 'Password must be at least 8 characters long.' });
    }

    const resetFilter = token
      ? { passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } }
      : { email, passwordResetToken: otp, passwordResetExpires: { $gt: Date.now() } };

    const user = await User.findOne(resetFilter);

    if (!user) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid or expired reset OTP.' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    try {
      await sendPasswordResetSuccessEmail(user);
    } catch (mailErr) {
      logger.error(`Error sending password reset success email to ${user.email}: ${mailErr.message}`);
    }

    logger.info(`Password reset successfully for: ${user.email}`);

    return successResponse(res, {
      statusCode: 200,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password (logged-in user)
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return errorResponse(res, { statusCode: 400, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return errorResponse(res, { statusCode: 400, message: 'New password must be at least 8 characters long.' });
    }

    // Retrieve user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return errorResponse(res, { statusCode: 400, message: 'Current password is incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    try {
      await sendPasswordChangedEmail(user);
    } catch (mailErr) {
      logger.error(`Error sending password changed email to ${user.email}: ${mailErr.message}`);
    }

    logger.info(`Password changed successfully for user: ${user.email}`);

    return successResponse(res, {
      statusCode: 200,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  return successResponse(res, {
    message: 'User fetched successfully.',
    data: { user: req.user },
  });
};

// @desc    Update current user's profile
// @route   PATCH /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'organization', 'designation'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    });

    if (!updates.firstName || !updates.lastName) {
      return errorResponse(res, { statusCode: 400, message: 'First name and last name are required.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    }

    logger.info(`Profile updated for: ${user.email}`);

    return successResponse(res, {
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    if (req.user) {
      logger.info(`User logged out: ${req.user.email}`);
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile image
// @route   POST /api/auth/profile-image
// @access  Private
const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, { statusCode: 400, message: 'Please upload an image file (JPEG, PNG, WebP).' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    }

    // Save relative path: e.g. uploads/profiles/filename.png
    const relativePath = `uploads/profiles/${req.file.filename}`;
    user.profileImage = relativePath;
    await user.save({ validateBeforeSave: false });

    logger.info(`Profile image updated for: ${user.email}`);

    return successResponse(res, {
      message: 'Profile image updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const autoAssignApplicationsToJudge = async (user) => {
  if (user.role !== 'judge') return;
  
  try {
    const Judge = require('../models/Judge.model');
    const Application = require('../models/Application.model');
    const Notification = require('../models/Notification.model');
    const AuditLog = require('../models/AuditLog.model');
    const Category = require('../models/Category.model');
    
    // Find the corresponding Judge profile by email
    const judgeProfile = await Judge.findOne({
      email: user.email.toLowerCase(),
      status: 'Active',
      isDeleted: false
    });
    
    if (!judgeProfile || !judgeProfile.awardSubCategories || judgeProfile.awardSubCategories.length === 0) {
      logger.info(`Auto-assign skipped for judge ${user.email}: no active Judge profile or category configurations found.`);
      return;
    }
    
    // Find Category documents corresponding to the judge's awardSubCategories
    const categories = await Category.find({
      name: { $in: judgeProfile.awardSubCategories }
    });
    
    if (categories.length === 0) {
      logger.info(`Auto-assign skipped for judge ${user.email}: Category documents not found.`);
      return;
    }
    
    const categoryIds = categories.map(c => c._id);
    
    // Find all active applications belonging to these categories
    const applications = await Application.find({
      category: { $in: categoryIds },
      isEligible: true,
      status: { $in: ['submitted', 'initial_screening', 'f2f_stage'] }
    });
    
    if (applications.length === 0) {
      logger.info(`Auto-assign: No matching active applications found for judge ${user.email}.`);
      return;
    }
    
    let assignedCount = 0;
    
    for (const app of applications) {
      const isF2F = app.status === 'f2f_stage';
      let changed = false;
      
      if (isF2F) {
        if (!app.assignedJudgesF2F.includes(user._id)) {
          app.assignedJudgesF2F.push(user._id);
          changed = true;
        }
      } else {
        if (!app.assignedJudges.includes(user._id)) {
          app.assignedJudges.push(user._id);
          changed = true;
        }
      }
      
      if (changed) {
        await app.save();
        assignedCount++;
        
        // Notify the judge
        await Notification.create({
          recipient: user._id,
          type: 'judge_assigned',
          title: isF2F ? 'New F2F Application Assigned (Auto-Assign)' : 'New Application Assigned (Auto-Assign)',
          message: `You have been automatically assigned to evaluate "${app.projectTitle}".`,
          link: isF2F ? `/judge-dashboard/evaluate/${app._id}?stage=f2f` : `/judge-dashboard/evaluate/${app._id}`,
          relatedApplication: app._id,
        });
        
        // Audit log
        await AuditLog.create({
          action: isF2F ? 'judge_assigned_f2f' : 'judge_assigned',
          performedBy: user._id,
          targetModel: 'Application',
          targetId: app._id,
          description: `Automatically assigned judge ${user.firstName} ${user.lastName} on registration matching subcategory.`,
        });
      }
    }
    
    logger.info(`Auto-assigned judge ${user.email} to ${assignedCount} application(s).`);
  } catch (err) {
    logger.error(`Error auto-assigning applications to judge ${user.email}: ${err.message}`);
  }
};

module.exports = { register, login, getMe, logout, verifyOTP, resendOTP, forgotPassword, resetPassword, changePassword, updateProfile, updateProfileImage };
