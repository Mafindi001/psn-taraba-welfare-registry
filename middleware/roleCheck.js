// middleware/roleCheck.js
// Role-based access control middleware

const { HTTP_STATUS, MESSAGES, PERMISSIONS } = require('../utils/constants');

/**
 * Check if user has required role
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED
      });
    }
    
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN
      });
    }
    
    next();
  };
};

/**
 * Check if admin has required permission
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || req.userRole === 'member') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN
      });
    }
    
    // Super admin has all permissions
    if (req.user.role === 'Super Admin') {
      return next();
    }
    
    // Check if admin has required permissions
    const hasPermission = requiredPermissions.every(permission =>
      req.user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have the required permissions for this action.'
      });
    }
    
    next();
  };
};

/**
 * Check if user is accessing their own resource
 */
const requireOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.memberId || req.params.id;
  
  // Admins can access any resource
  if (req.userRole === 'admin' || req.userRole === 'super_admin') {
    return next();
  }
  
  // Members can only access their own resources
  if (req.userId.toString() !== resourceUserId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You can only access your own resources.'
    });
  }
  
  next();
};

module.exports = {
  requireRole,
  requirePermission,
  requireOwnership
};