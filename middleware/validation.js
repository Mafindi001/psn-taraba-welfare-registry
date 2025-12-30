// middleware/validation.js
// Input validation middleware

const { body, validationResult } = require('express-validator');
const { HTTP_STATUS, MESSAGES, LOCAL_GOVERNMENTS } = require('../utils/constants');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Member registration validation rules
 */
const validateMemberRegistration = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Full name must be between 3 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
  
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+234|0)[789][01]\d{8}$/).withMessage('Invalid Nigerian phone number format'),
  
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(value => {
      const age = Math.floor((new Date() - new Date(value)) / 31557600000);
      if (age < 18) throw new Error('You must be at least 18 years old');
      if (age > 100) throw new Error('Invalid date of birth');
      return true;
    }),
  
  body('psnMembershipNumber')
    .trim()
    .notEmpty().withMessage('PSN membership number is required')
    .toUpperCase(),
  
  body('psnYearOfInduction')
    .notEmpty().withMessage('Year of induction is required')
    .isInt({ min: 1960, max: new Date().getFullYear() }).withMessage('Invalid year of induction'),
  
  body('localGovernment')
    .trim()
    .notEmpty().withMessage('Local government is required')
    .isIn(LOCAL_GOVERNMENTS).withMessage('Invalid local government'),
  
  body('nextOfKin.name')
    .trim()
    .notEmpty().withMessage('Next of kin name is required'),
  
  body('nextOfKin.relationship')
    .trim()
    .notEmpty().withMessage('Next of kin relationship is required'),
  
  body('nextOfKin.phoneNumber')
    .trim()
    .notEmpty().withMessage('Next of kin phone number is required'),
  
  body('dataConsent')
    .notEmpty().withMessage('Data consent is required')
    .isBoolean().withMessage('Data consent must be true or false')
    .custom(value => value === true).withMessage('You must consent to data collection'),
  
  handleValidationErrors
];

/**
 * Member login validation rules
 */
const validateMemberLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Admin login validation rules
 */
const validateAdminLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Special date validation rules
 */
const validateSpecialDate = [
  body('eventLabel')
    .trim()
    .notEmpty().withMessage('Event label is required')
    .isIn(['Birthday', 'Wedding Anniversary', 'Work Anniversary', 'Induction Anniversary', 'Other Celebration'])
    .withMessage('Invalid event type'),
  
  body('eventDate')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('isRecurring')
    .optional()
    .isBoolean().withMessage('isRecurring must be true or false'),
  
  body('sendReminder')
    .optional()
    .isBoolean().withMessage('sendReminder must be true or false'),
  
  handleValidationErrors
];

/**
 * Profile update validation rules
 */
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Full name must be between 3 and 100 characters'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^(\+234|0)[789][01]\d{8}$/).withMessage('Invalid Nigerian phone number format'),
  
  body('placeOfWork')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Place of work cannot exceed 200 characters'),
  
  body('residentialAddress')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),
  
  body('localGovernment')
    .optional()
    .trim()
    .isIn(LOCAL_GOVERNMENTS).withMessage('Invalid local government'),
  
  handleValidationErrors
];

module.exports = {
  validateMemberRegistration,
  validateMemberLogin,
  validateAdminLogin,
  validateSpecialDate,
  validateProfileUpdate,
  handleValidationErrors
};