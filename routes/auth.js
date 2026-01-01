// routes/auth.js
const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

// Login route
router.post('/login', (req, res) => {
  // Your login logic here
  res.json({ message: 'Login endpoint', success: true });
});

// Register route
router.post('/register', (req, res) => {
  // Your registration logic here
  res.json({ message: 'Register endpoint', success: true });
});

module.exports = router;