// routes/admin.js
const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin route working' });
});

// Admin dashboard data
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

module.exports = router;