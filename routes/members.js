// routes/members.js
// Member-specific routes (profile, special dates)

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getSpecialDates,
  addSpecialDate,
  updateSpecialDate,
  deleteSpecialDate
} = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateSpecialDate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);
router.use(requireRole('member', 'admin'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Special dates routes
router.get('/special-dates', getSpecialDates);
router.post('/special-dates', validateSpecialDate, addSpecialDate);
router.put('/special-dates/:dateId', validateSpecialDate, updateSpecialDate);
router.delete('/special-dates/:dateId', deleteSpecialDate);

module.exports = router;