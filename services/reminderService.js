// services/reminderService.js
// Automated reminder service for upcoming celebrations

const SpecialDate = require('../models/SpecialDate');
const Member = require('../models/Member');
const ReminderLog = require('../models/ReminderLog');
const Admin = require('../models/Admin');
const { sendEmail } = require('../config/email');
const { generateReminderEmail, generateReminderText } = require('./emailTemplates/reminderTemplate');

/**
 * Calculate days until event (recurring aware)
 */
function calculateDaysUntil(eventDate, isRecurring) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  
  if (isRecurring) {
    event.setFullYear(today.getFullYear());
    if (event < today) {
      event.setFullYear(today.getFullYear() + 1);
    }
  }
  
  const diffTime = event - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get upcoming celebrations that need reminders
 */
const getUpcomingCelebrations = async () => {
  try {
    console.log('🔍 Checking for upcoming celebrations...');
    
    // Get all active special dates with member info
    const specialDates = await SpecialDate.find({ 
      isActive: true,
      sendReminder: true
    }).populate('member', 'fullName email phoneNumber');

    const upcomingCelebrations = [];

    for (const specialDate of specialDates) {
      if (!specialDate.member) continue;

      const daysUntil = calculateDaysUntil(specialDate.eventDate, specialDate.isRecurring);
      const hoursUntil = daysUntil * 24;

      // Check if reminder should be sent (within reminder window)
      if (hoursUntil >= 0 && hoursUntil <= specialDate.reminderHoursBefore) {
        // Check if reminder was already sent today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alreadySent = await ReminderLog.findOne({
          specialDate: specialDate._id,
          sentAt: { $gte: today }
        });

        if (!alreadySent) {
          upcomingCelebrations.push({
            specialDate,
            member: specialDate.member,
            daysUntil
          });
        }
      }
    }

    console.log(`✅ Found ${upcomingCelebrations.length} celebrations needing reminders`);
    return upcomingCelebrations;

  } catch (error) {
    console.error('❌ Error getting upcoming celebrations:', error);
    throw error;
  }
};

/**
 * Get welfare officers emails
 */
const getWelfareOfficersEmails = async () => {
  try {
    const admins = await Admin.find({ 
      isActive: true,
      permissions: 'view_members'
    }).select('email fullName');

    return admins.map(admin => ({
      email: admin.email,
      name: admin.fullName
    }));
  } catch (error) {
    console.error('❌ Error getting welfare officers:', error);
    return [];
  }
};

/**
 * Send reminder for a celebration
 */
const sendCelebrationReminder = async (celebration) => {
  const { specialDate, member, daysUntil } = celebration;

  console.log(`📧 Sending reminder for ${member.fullName} - ${specialDate.eventLabel}`);

  const reminderLog = new ReminderLog({
    specialDate: specialDate._id,
    member: member._id,
    eventLabel: specialDate.eventLabel,
    eventDate: specialDate.eventDate,
    sentAt: new Date(),
    recipients: [],
    overallStatus: 'Pending'
  });

  const emailData = {
    memberName: member.fullName,
    eventLabel: specialDate.eventLabel,
    customLabel: specialDate.customLabel,
    eventDate: specialDate.eventDate,
    daysUntil,
    memberPhone: member.phoneNumber,
    memberEmail: member.email
  };

  const emailHtml = generateReminderEmail(emailData);
  const emailText = generateReminderText(emailData);

  const displayLabel = specialDate.eventLabel === 'Other Celebration' && specialDate.customLabel 
    ? specialDate.customLabel 
    : specialDate.eventLabel;

  const emailSubject = daysUntil === 0 
    ? `🎉 Today: ${member.fullName}'s ${displayLabel}!`
    : daysUntil === 1
    ? `📅 Tomorrow: ${member.fullName}'s ${displayLabel}`
    : `📅 Upcoming: ${member.fullName}'s ${displayLabel} in ${daysUntil} days`;

  reminderLog.emailSubject = emailSubject;
  reminderLog.emailTemplate = 'celebration_reminder';

  // Determine recipients based on reminder settings
  const recipientsToSend = [];

  // Send to member if included
  if (specialDate.reminderRecipients.includes('Member')) {
    recipientsToSend.push({
      email: member.email,
      type: 'Member',
      status: 'Pending'
    });
  }

  // Send to welfare officers if included
  if (specialDate.reminderRecipients.includes('Welfare Officers')) {
    const welfareOfficers = await getWelfareOfficersEmails();
    welfareOfficers.forEach(officer => {
      recipientsToSend.push({
        email: officer.email,
        type: 'Welfare Officer',
        status: 'Pending'
      });
    });
  }

  // Send emails
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipientsToSend) {
    try {
      await sendEmail({
        to: recipient.email,
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      });

      recipient.status = 'Sent';
      recipient.sentAt = new Date();
      sentCount++;

      console.log(`  ✅ Sent to ${recipient.email}`);
    } catch (error) {
      recipient.status = 'Failed';
      recipient.error = error.message;
      failedCount++;

      console.error(`  ❌ Failed to send to ${recipient.email}:`, error.message);
    }

    reminderLog.recipients.push(recipient);
  }

  // Update overall status
  if (sentCount === recipientsToSend.length) {
    reminderLog.overallStatus = 'Sent';
  } else if (sentCount > 0) {
    reminderLog.overallStatus = 'Partially Sent';
  } else {
    reminderLog.overallStatus = 'Failed';
  }

  await reminderLog.save();

  return {
    success: sentCount > 0,
    sentCount,
    failedCount,
    totalRecipients: recipientsToSend.length
  };
};

/**
 * Process all upcoming reminders
 */
const processReminders = async () => {
  console.log('\n🎉 ===== REMINDER SERVICE STARTED =====');
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);

  try {
    const celebrations = await getUpcomingCelebrations();

    if (celebrations.length === 0) {
      console.log('ℹ️  No reminders to send today');
      console.log('===== REMINDER SERVICE COMPLETED =====\n');
      return {
        success: true,
        processed: 0,
        sent: 0,
        failed: 0
      };
    }

    console.log(`📬 Processing ${celebrations.length} reminder(s)...`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const celebration of celebrations) {
      const result = await sendCelebrationReminder(celebration);
      totalSent += result.sentCount;
      totalFailed += result.failedCount;
    }

    console.log('\n📊 Summary:');
    console.log(`   Celebrations processed: ${celebrations.length}`);
    console.log(`   Emails sent: ${totalSent}`);
    console.log(`   Emails failed: ${totalFailed}`);
    console.log('===== REMINDER SERVICE COMPLETED =====\n');

    return {
      success: true,
      processed: celebrations.length,
      sent: totalSent,
      failed: totalFailed
    };

  } catch (error) {
    console.error('❌ Error processing reminders:', error);
    console.log('===== REMINDER SERVICE FAILED =====\n');
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Manual trigger for testing
 */
const triggerRemindersManually = async () => {
  console.log('🔧 Manual reminder trigger initiated');
  return await processReminders();
};

module.exports = {
  processReminders,
  triggerRemindersManually,
  getUpcomingCelebrations,
  sendCelebrationReminder
};