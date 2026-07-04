const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { errorResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Fallback: Check cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Access denied. No token provided.',
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Token is no longer valid. User not found.',
      });
    }

    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, { statusCode: 401, message: 'Token has expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, { statusCode: 401, message: 'Invalid token.' });
    }
    return errorResponse(res, { statusCode: 500, message: 'Authentication error.' });
  }
};

module.exports = { authenticate };
