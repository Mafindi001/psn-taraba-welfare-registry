// services/scheduler.js
const cron = require('node-cron');
const reminderService = require('./reminderService');

class Scheduler {
  start() {
    console.log('⏰ Starting automated reminder scheduler...');
    
    // Schedule daily at 8:00 AM Nigeria time
    cron.schedule('0 8 * * *', async () => {
      console.log(`🔔 Running scheduled reminder check at ${new Date().toLocaleTimeString()}`);
      await reminderService.checkAndSendReminders();
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });
    
    console.log('✅ Scheduler started. Will run daily at 8:00 AM WAT');
    
    // Run once immediately (for testing)
    reminderService.checkAndSendReminders();
  }
}

module.exports = new Scheduler();