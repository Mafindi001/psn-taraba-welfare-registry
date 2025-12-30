// create-admin.js
// Script to create initial admin user

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const { connectDatabase, disconnectDatabase } = require('./config/database');

const createAdmin = async () => {
  try {
    await connectDatabase();
    
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'welfare@psntaraba.org' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      await disconnectDatabase();
      process.exit(0);
    }
    
    // Create admin
    const admin = await Admin.create({
      fullName: 'PSN Welfare Secretary',
      email: 'welfare@psntaraba.org',
      password: 'Admin@PSN2024',
      phoneNumber: '+2348012345678',
      role: 'Super Admin',
      psnPosition: 'Welfare Secretary',
      isActive: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Admin@PSN2024');
    console.log('Role:', admin.role);
    
    await disconnectDatabase();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();