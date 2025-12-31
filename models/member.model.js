// models/member.model.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  psnNumber: {
    type: String,
    required: [true, 'PSN membership number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  yearOfInduction: {
    type: Number,
    required: [true, 'Year of induction is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  localGovernment: {
    type: String,
    required: [true, 'Local government is required'],
    trim: true
  },
  placeOfWork: {
    type: String,
    required: [true, 'Place of work is required'],
    trim: true
  },
  nextOfKin: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  specialDates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecialDate'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for faster queries
memberSchema.index({ email: 1 });
memberSchema.index({ psnNumber: 1 });
memberSchema.index({ localGovernment: 1 });

// Method to get full name
memberSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Virtual for age calculation
memberSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Remove password when converting to JSON
memberSchema.methods.toJSON = function() {
  const member = this.toObject();
  delete member.password;
  delete member.__v;
  return member;
};

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;