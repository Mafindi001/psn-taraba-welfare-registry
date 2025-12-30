// config/database.js
// MongoDB connection configuration using Mongoose

const mongoose = require('mongoose');
const config = require('./environment');

// MongoDB connection options
const options = {
  // Use new URL parser
  useNewUrlParser: true,
  
  // Use unified topology
  useUnifiedTopology: true,
  
  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  
  // Pool size for production
  maxPoolSize: 10,
  minPoolSize: 2
};

/**
 * Connect to MongoDB database
 */
const connectDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(config.mongodbUri, options);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed');
    console.error('Error:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB Disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};