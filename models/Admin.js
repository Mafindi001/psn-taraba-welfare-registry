// models/Admin.js
// Admin (Welfare Officers) database schema

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Full name must be at least 3 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['Super Admin', 'Welfare Secretary', 'Assistant Welfare', 'Viewer'],
    default: 'Viewer'
  },
  
  permissions: [{
    type: String,
    enum: [
      'view_members',
      'edit_members',
      'delete_members',
      'view_reports',
      'export_data',
      'send_reminders',
      'manage_admins'
    ]
  }],
  
  // PSN Position
  psnPosition: {
    type: String,
    trim: true
  },
  
  tenureStart: {
    type: Date
  },
  
  tenureEnd: {
    type: Date
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Audit Trail
  lastLogin: {
    type: Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date
  },
  
  passwordChangedAt: {
    type: Date
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
  
}, {
  timestamps: true
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const config = require('../config/environment');
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure JWT is valid
  
  next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = async function() {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (!this.isModified('role')) {
    return next();
  }
  
  switch (this.role) {
    case 'Super Admin':
      this.permissions = [
        'view_members',
        'edit_members',
        'delete_members',
        'view_reports',
        'export_data',
        'send_reminders',
        'manage_admins'
      ];
      break;
    case 'Welfare Secretary':
      this.permissions = [
        'view_members',
        'edit_members',
        'view_reports',
        'export_data',
        'send_reminders'
      ];
      break;
    case 'Assistant Welfare':
      this.permissions = [
        'view_members',
        'view_reports',
        'send_reminders'
      ];
      break;
    case 'Viewer':
      this.permissions = ['view_members', 'view_reports'];
      break;
  }
  
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;