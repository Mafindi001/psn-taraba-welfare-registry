// routes/members.js
const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Members route working' });
});

// Get all members
router.get('/', (req, res) => {
  res.json({ message: 'Get all members' });
});

// Get single member
router.get('/:id', (req, res) => {
  res.json({ message: `Get member ${req.params.id}` });
});

module.exports = router;