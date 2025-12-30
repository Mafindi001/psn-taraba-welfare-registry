// routes/admin.js
// Admin-specific routes

const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  getUpcomingCelebrations,
  getDashboardStats
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

// All routes require admin authentication
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Members management
router.get('/members', requirePermission('view_members'), getAllMembers);
router.get('/members/:memberId', requirePermission('view_members'), getMemberById);

// Celebrations
router.get('/celebrations', requirePermission('view_members'), getUpcomingCelebrations);

module.exports = router;