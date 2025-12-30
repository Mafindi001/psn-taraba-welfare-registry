// config/environment.js
// Loads and validates environment variables

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error.message);
  console.error('Make sure .env file exists in the project root directory');
  process.exit(1);
}

console.log('✅ .env file loaded successfully');
console.log('');

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('');
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ All required environment variables are set');
console.log('');

// Export configuration object
module.exports = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  appName: process.env.APP_NAME || 'PSN Taraba Welfare Registry',
  
  // Database
  mongodbUri: process.env.MONGODB_URI,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM
  },
  
  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL,
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD
  },
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Reminders
  reminder: {
    cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *',
    hoursBefore: parseInt(process.env.REMINDER_HOURS_BEFORE) || 24
  },
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000'
};