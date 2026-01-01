// services/reminderScheduler.js
const cron = require('node-cron');
const Member = require('../models/member.model');        // Correct path
const SpecialDate = require('../models/specialDate.model'); // Correct path
const emailService = require('./emailService');          // Same folder

class ReminderScheduler {
  async checkAndSendReminders() {
    console.log('\n🔔 Checking for upcoming celebrations...');
    
    try {
      // Get tomorrow's date at midnight
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      console.log(`📅 Looking for events on: ${tomorrow.toDateString()}`);
      
      // Find all special dates
      const allDates = await SpecialDate.find({})
        .populate('memberId', 'firstName lastName email');
      
      // Filter dates happening tomorrow (handles recurring)
      const tomorrowEvents = allDates.filter(event => {
        const eventDate = new Date(event.eventDate);
        
        if (event.isRecurring) {
          // For recurring events, compare month and day only
          return eventDate.getMonth() === tomorrow.getMonth() && 
                 eventDate.getDate() === tomorrow.getDate();
        } else {
          // For one-time events, compare full date
          return eventDate >= tomorrow && eventDate < dayAfterTomorrow;
        }
      });
      
      console.log(`📧 Found ${tomorrowEvents.length} events for tomorrow`);
      
      // Send emails
      let sentCount = 0;
      for (const event of tomorrowEvents) {
        if (event.memberId && event.memberId.email) {
          console.log(`  → ${event.memberId.email}: ${event.eventLabel}`);
          
          const result = await emailService.sendReminder(event.memberId, event);
          if (result.success) {
            sentCount++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`✅ Sent ${sentCount}/${tomorrowEvents.length} reminder emails\n`);
      return { success: true, sent: sentCount, total: tomorrowEvents.length };
      
    } catch (error) {
      console.error('❌ Error in reminder scheduler:', error);
      return { success: false, error: error.message };
    }
  }
  
  start() {
    console.log('⏰ Starting automated reminder system...');
    
    // Schedule daily at 8:00 AM (Nigeria time)
    cron.schedule('0 8 * * *', () => {
      const now = new Date();
      console.log(`\n⏰ Scheduled check at ${now.toLocaleTimeString()}`);
      this.checkAndSendReminders();
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });
    
    console.log('✅ Scheduler started. Will run daily at 8:00 AM WAT');
    
    // Also run once now (for testing)
    console.log('🧪 Running initial check...');
    this.checkAndSendReminders();
  }
}

// Export instance
module.exports = new ReminderScheduler();