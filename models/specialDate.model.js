// models/specialDate.model.js
const mongoose = require('mongoose');

const specialDateSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member ID is required'],
    index: true
  },
  eventLabel: {
    type: String,
    required: [true, 'Event label is required'],
    enum: ['Birthday', 'Wedding Anniversary', 'Work Anniversary', 'Induction Anniversary', 'Other Celebration'],
    default: 'Birthday'
  },
  customLabel: {
    type: String,
    trim: true,
    default: ''
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    index: true
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  sendReminder: {
    type: Boolean,
    default: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  lastReminderSent: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  notificationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
specialDateSchema.index({ memberId: 1, eventDate: 1 });
specialDateSchema.index({ eventDate: 1, isRecurring: 1 });
specialDateSchema.index({ reminderSent: 1, eventDate: 1 });

// Virtual for display label
specialDateSchema.virtual('displayLabel').get(function() {
  return this.eventLabel === 'Other Celebration' && this.customLabel 
    ? this.customLabel 
    : this.eventLabel;
});

// Method to check if reminder should be sent today
specialDateSchema.methods.shouldSendReminder = function() {
  if (!this.sendReminder || this.reminderSent) return false;
  
  const today = new Date();
  const eventDate = new Date(this.eventDate);
  
  // For recurring events, check month/day
  if (this.isRecurring) {
    eventDate.setFullYear(today.getFullYear());
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
  }
  
  // Calculate days difference
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Send reminder 1 day before (24 hours)
  return diffDays === 1;
};

// Method to get next occurrence date
specialDateSchema.methods.getNextOccurrence = function() {
  const today = new Date();
  const eventDate = new Date(this.eventDate);
  
  if (this.isRecurring) {
    eventDate.setFullYear(today.getFullYear());
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
    return eventDate;
  }
  
  return eventDate;
};

// Method to get days until event
specialDateSchema.methods.getDaysUntil = function() {
  const today = new Date();
  const nextDate = this.getNextOccurrence();
  
  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 ? diffDays : null;
};

// Pre-save middleware to update reminder status
specialDateSchema.pre('save', function(next) {
  if (this.isModified('eventDate') || this.isModified('reminderSent')) {
    const daysUntil = this.getDaysUntil();
    if (daysUntil !== 1) {
      this.reminderSent = false;
    }
  }
  next();
});

const SpecialDate = mongoose.model('SpecialDate', specialDateSchema);

module.exports = SpecialDate;