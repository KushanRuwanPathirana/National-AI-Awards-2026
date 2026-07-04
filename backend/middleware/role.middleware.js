const { errorResponse } = require('../utils/apiResponse');

/**
 * Factory function that returns middleware restricting access to specified roles.
 * Usage: router.get('/admin-only', authenticate, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
