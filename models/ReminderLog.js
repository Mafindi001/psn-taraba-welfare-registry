// models/ReminderLog.js
// Reminder delivery tracking schema

const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
  // Reference to special date
  specialDate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecialDate',
    required: true
  },
  
  // Reference to member
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  
  // Reminder Details
  eventLabel: {
    type: String,
    required: true
  },
  
  eventDate: {
    type: Date,
    required: true
  },
  
  // Delivery Information
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  recipients: [{
    email: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Member', 'Welfare Officer', 'Other'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Failed', 'Bounced'],
      default: 'Pending'
    },
    sentAt: Date,
    error: String
  }],
  
  // Overall Status
  overallStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Partially Sent', 'Failed'],
    default: 'Pending'
  },
  
  // Email Details
  emailSubject: String,
  emailTemplate: String,
  
  // Error Tracking
  attemptCount: {
    type: Number,
    default: 1
  },
  
  lastAttemptAt: {
    type: Date,
    default: Date.now
  },
  
  errorMessage: String,
  
  // Retry Information
  willRetry: {
    type: Boolean,
    default: false
  },
  
  nextRetryAt: Date,
  
  maxRetries: {
    type: Number,
    default: 3
  }
  
}, {
  timestamps: true
});

// Indexes for efficient querying
reminderLogSchema.index({ specialDate: 1 });
reminderLogSchema.index({ member: 1 });
reminderLogSchema.index({ sentAt: -1 });
reminderLogSchema.index({ overallStatus: 1 });

// Method to mark reminder as sent
reminderLogSchema.methods.markAsSent = async function() {
  this.overallStatus = 'Sent';
  return this.save();
};

// Method to mark reminder as failed
reminderLogSchema.methods.markAsFailed = async function(errorMessage) {
  this.overallStatus = 'Failed';
  this.errorMessage = errorMessage;
  
  // Schedule retry if within max attempts
  if (this.attemptCount < this.maxRetries) {
    this.willRetry = true;
    this.nextRetryAt = new Date(Date.now() + (60 * 60 * 1000)); // Retry in 1 hour
  }
  
  return this.save();
};

// Method to record retry attempt
reminderLogSchema.methods.recordRetry = async function() {
  this.attemptCount += 1;
  this.lastAttemptAt = Date.now();
  
  if (this.attemptCount >= this.maxRetries) {
    this.willRetry = false;
  }
  
  return this.save();
};

const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);

module.exports = ReminderLog;