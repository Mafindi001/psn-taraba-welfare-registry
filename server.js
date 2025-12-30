// server.js
// Main application entry point

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
const config = require('./config/environment');
const { connectDatabase } = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();

// Connect to database
connectDatabase();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000, // 15 minutes
  max: config.rateLimitMaxRequests, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Strict rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
// API routes
app.use('/api/auth', authRoutes);
const memberRoutes = require('./routes/members');
app.use('/api/members', memberRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PSN Taraba Welfare Registry API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🎉 PSN TARABA WELFARE REGISTRY');
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  console.log('='.repeat(60));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  
  // Exit process
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;