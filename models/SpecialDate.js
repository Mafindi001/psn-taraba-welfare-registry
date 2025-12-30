// models/SpecialDate.js
// Special dates (birthdays, anniversaries, etc.) schema

const mongoose = require('mongoose');

const specialDateSchema = new mongoose.Schema({
  // Reference to member
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member reference is required']
  },
  
  // Event Details
  eventLabel: {
    type: String,
    required: [true, 'Event label is required'],
    trim: true,
    maxlength: [100, 'Event label cannot exceed 100 characters'],
    enum: {
      values: [
        'Birthday',
        'Wedding Anniversary',
        'Work Anniversary',
        'Induction Anniversary',
        'Other Celebration'
      ],
      message: '{VALUE} is not a valid event type'
    }
  },
  
  customLabel: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom label cannot exceed 100 characters']
  },
  
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  
  // Recurrence Settings
  isRecurring: {
    type: Boolean,
    default: true // Most events repeat annually
  },
  
  recurringPattern: {
    type: String,
    enum: ['Annually', 'One-time'],
    default: 'Annually'
  },
  
  // Reminder Settings
  sendReminder: {
    type: Boolean,
    default: true
  },
  
  reminderRecipients: [{
    type: String,
    enum: ['Member', 'Welfare Officers', 'All Members'],
    default: ['Member', 'Welfare Officers']
  }],
  
  reminderHoursBefore: {
    type: Number,
    default: 24,
    min: [1, 'Reminder must be at least 1 hour before'],
    max: [168, 'Reminder cannot be more than 7 days before'] // Max 7 days
  },
  
  // Additional Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel'
  },
  
  createdByModel: {
    type: String,
    enum: ['Member', 'Admin']
  }
  
}, {
  timestamps: true
});

// Index for efficient querying
specialDateSchema.index({ member: 1, eventDate: 1 });
specialDateSchema.index({ eventDate: 1, isActive: 1 });

// Virtual for days until event
specialDateSchema.virtual('daysUntilEvent').get(function() {
  const today = new Date();
  const eventDate = new Date(this.eventDate);
  
  // Adjust event date to current year for recurring events
  if (this.isRecurring) {
    eventDate.setFullYear(today.getFullYear());
    
    // If event has passed this year, use next year
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
  }
  
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Method to check if reminder should be sent
specialDateSchema.methods.shouldSendReminder = function() {
  if (!this.sendReminder || !this.isActive) {
    return false;
  }
  
  const daysUntil = this.daysUntilEvent;
  const hoursUntil = daysUntil * 24;
  
  // Send reminder if within the specified hours before event
  return hoursUntil <= this.reminderHoursBefore && hoursUntil > 0;
};

const SpecialDate = mongoose.model('SpecialDate', specialDateSchema);

module.exports = SpecialDate;