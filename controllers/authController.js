// controllers/authController.js
// Authentication controller - handles registration and login

const Member = require('../models/Member');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new member
 * @access  Public
 */
const registerMember = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      psnMembershipNumber,
      psnYearOfInduction,
      placeOfWork,
      residentialAddress,
      localGovernment,
      nextOfKin,
      dataConsent
    } = req.body;
    
    // Check if email already exists
    const existingEmail = await Member.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: MESSAGES.EMAIL_EXISTS
      });
    }
    
    // Check if PSN membership number already exists
    const existingPSN = await Member.findOne({ 
      psnMembershipNumber: psnMembershipNumber.toUpperCase() 
    });
    if (existingPSN) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: MESSAGES.PSN_NUMBER_EXISTS
      });
    }
    
    // Create new member
    const member = await Member.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      dateOfBirth,
      psnMembershipNumber: psnMembershipNumber.toUpperCase(),
      psnYearOfInduction,
      placeOfWork,
      residentialAddress,
      localGovernment,
      nextOfKin,
      dataConsent,
      consentDate: dataConsent ? new Date() : null
    });
    
    // Generate token
    const token = generateToken(member._id, 'member');
    
    // Return success response
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.REGISTRATION_SUCCESS,
      data: {
        member: member.getPublicProfile(),
        token
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login member
 * @access  Public
 */
const loginMember = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find member and include password field
    const member = await Member.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');
    
    if (!member) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Check if account is active
    if (!member.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await member.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Update last login
    member.lastLogin = new Date();
    await member.save();
    
    // Generate token
    const token = generateToken(member._id, 'member');
    
    // Return success response
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: {
        member: member.getPublicProfile(),
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/auth/admin/login
 * @desc    Login admin
 * @access  Public
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find admin and include password field
    const admin = await Admin.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');
    
    if (!admin) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Check if account is locked
    if (admin.isLocked()) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `${MESSAGES.ACCOUNT_LOCKED}. Try again in ${lockTimeRemaining} minutes.`
      });
    }
    
    // Check if account is active
    if (!admin.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Your account is inactive. Please contact the super admin.'
      });
    }
    
    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate token with admin role
    const token = generateToken(admin._id, 'admin');
    
    // Return success response (exclude password)
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.__v;
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: {
        admin: adminData,
        token
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    let user;
    
    if (req.userRole === 'admin' || req.userRole === 'super_admin') {
      user = await Admin.findById(req.userId).select('-password');
    } else {
      user = await Member.findById(req.userId).select('-password');
    }
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user,
        role: req.userRole
      }
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // In JWT authentication, logout is handled client-side by removing the token
    // This endpoint is mainly for logging purposes
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.LOGOUT_SUCCESS
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }
    
    // Get user with password
    let user;
    if (req.userRole === 'admin' || req.userRole === 'super_admin') {
      user = await Admin.findById(req.userId).select('+password');
    } else {
      user = await Member.findById(req.userId).select('+password');
    }
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
};

module.exports = {
  registerMember,
  loginMember,
  loginAdmin,
  getCurrentUser,
  logout,
  changePassword
};