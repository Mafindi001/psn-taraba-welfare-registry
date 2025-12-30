// utils/constants.js
// Application constants

module.exports = {
  // User roles
  ROLES: {
    MEMBER: 'member',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  
  // Admin permissions
  PERMISSIONS: {
    VIEW_MEMBERS: 'view_members',
    EDIT_MEMBERS: 'edit_members',
    DELETE_MEMBERS: 'delete_members',
    VIEW_REPORTS: 'view_reports',
    EXPORT_DATA: 'export_data',
    SEND_REMINDERS: 'send_reminders',
    MANAGE_ADMINS: 'manage_admins'
  },
  
  // Event types
  EVENT_TYPES: {
    BIRTHDAY: 'Birthday',
    WEDDING_ANNIVERSARY: 'Wedding Anniversary',
    WORK_ANNIVERSARY: 'Work Anniversary',
    INDUCTION_ANNIVERSARY: 'Induction Anniversary',
    OTHER: 'Other Celebration'
  },
  
  // Reminder statuses
  REMINDER_STATUS: {
    PENDING: 'Pending',
    SENT: 'Sent',
    PARTIALLY_SENT: 'Partially Sent',
    FAILED: 'Failed'
  },
  
  // Email recipient types
  RECIPIENT_TYPES: {
    MEMBER: 'Member',
    WELFARE_OFFICERS: 'Welfare Officers',
    ALL_MEMBERS: 'All Members'
  },
  
  // Taraba State Local Governments
  LOCAL_GOVERNMENTS: [
    'Ardo Kola',
    'Bali',
    'Donga',
    'Gashaka',
    'Gassol',
    'Ibi',
    'Jalingo',
    'Karim Lamido',
    'Kurmi',
    'Lau',
    'Sardauna',
    'Takum',
    'Ussa',
    'Wukari',
    'Yorro',
    'Zing'
  ],
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // Response messages
  MESSAGES: {
    // Success
    REGISTRATION_SUCCESS: 'Registration successful! Please log in.',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    UPDATE_SUCCESS: 'Update successful',
    DELETE_SUCCESS: 'Deleted successfully',
    
    // Errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    PSN_NUMBER_EXISTS: 'PSN membership number already registered',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission to perform this action',
    INVALID_TOKEN: 'Invalid or expired token',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Validation error',
    ACCOUNT_LOCKED: 'Account locked due to multiple failed login attempts',
    
    // Validation
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
    WEAK_PASSWORD: 'Password must be at least 8 characters',
    PASSWORD_MISMATCH: 'Passwords do not match',
    CONSENT_REQUIRED: 'Data consent is required'
  }
};