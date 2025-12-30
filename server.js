// server.js
// Temporary test file to verify database connection

// IMPORTANT: Load environment first, before any other imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('='.repeat(60));
console.log('ENVIRONMENT VARIABLE CHECK');
console.log('='.repeat(60));
console.log('Current directory:', __dirname);
console.log('.env path:', path.resolve(__dirname, '.env'));
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('First 50 chars:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT FOUND');
console.log('='.repeat(60));
console.log('');

// Now load other modules
const config = require('./config/environment');
const { connectDatabase } = require('./config/database');

// Test database connection
async function testConnection() {
  try {
    console.log('🚀 Starting PSN Taraba Welfare Registry...');
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`🔌 Port: ${config.port}`);
    console.log('');
    
    // Connect to database
    await connectDatabase();
    
    console.log('');
    console.log('✅ Database connection test successful!');
    console.log('🎉 All systems operational');
    
    // Close connection after test
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

// Run test
testConnection();