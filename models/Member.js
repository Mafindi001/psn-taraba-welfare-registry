// models/Member.js
// Member (Pharmacist) database schema

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Full name must be at least 3 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
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
    select: false // Don't return password in queries by default
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^(\+234|0)[789][01]\d{8}$/,
      'Please provide a valid Nigerian phone number'
    ]
  },
  
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  
  // PSN Information
  psnMembershipNumber: {
    type: String,
    required: [true, 'PSN membership number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  psnYearOfInduction: {
    type: Number,
    required: [true, 'Year of induction is required'],
    min: [1960, 'Invalid year of induction'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  
  // Additional Information
  placeOfWork: {
    type: String,
    trim: true,
    maxlength: [200, 'Place of work cannot exceed 200 characters']
  },
  
  residentialAddress: {
    type: String,
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  
  localGovernment: {
    type: String,
    required: [true, 'Local government is required'],
    trim: true
  },
  
  // Next of Kin
  nextOfKin: {
    name: {
      type: String,
      required: [true, 'Next of kin name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Next of kin phone number is required'],
      trim: true
    }
  },
  
  // Consent and Privacy
  dataConsent: {
    type: Boolean,
    required: [true, 'Data consent is required'],
    default: false
  },
  
  consentDate: {
    type: Date,
    default: Date.now
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  lastLogin: {
    type: Date
  },
  
  profileUpdatedAt: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for special dates
memberSchema.virtual('specialDates', {
  ref: 'SpecialDate',
  localField: '_id',
  foreignField: 'member'
});

// Pre-save middleware to hash password
memberSchema.pre('save', async function(next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }
  
  const config = require('../config/environment');
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Method to compare passwords
memberSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
memberSchema.methods.getPublicProfile = function() {
  const member = this.toObject();
  delete member.password;
  delete member.__v;
  return member;
};

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;