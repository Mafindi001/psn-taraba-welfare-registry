// routes/auth.js
// Authentication routes

const express = require('express');
const router = express.Router();
const {
  registerMember,
  loginMember,
  loginAdmin,
  getCurrentUser,
  logout,
  changePassword
} = require('../controllers/authController');
const {
  validateMemberRegistration,
  validateMemberLogin,
  validateAdminLogin
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', validateMemberRegistration, registerMember);
router.post('/login', validateMemberLogin, loginMember);
router.post('/admin/login', validateAdminLogin, loginAdmin);

// Protected routes (require authentication)
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

module.exports = router;