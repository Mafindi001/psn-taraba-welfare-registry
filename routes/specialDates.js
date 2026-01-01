// routes/specialDates.js
const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Special Dates route working' });
});

// Get all special dates
router.get('/', (req, res) => {
  res.json({ message: 'Get all special dates' });
});

// Add special date
router.post('/', (req, res) => {
  res.json({ message: 'Add special date' });
});

module.exports = router;