// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    // Verify email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email credentials not found in .env file');
      console.warn('   Email reminders will not work until configured');
      this.transporter = null;
      return;
    }
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });
    
    // Test connection
    this.verifyConnection();
  }
  
  async verifyConnection() {
    if (!this.transporter) return false;
    
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email connection failed:', error.message);
      return false;
    }
  }
  
  async sendReminder(member, event) {
    if (!this.transporter) {
      console.warn('⚠️  Email service not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }
    
    const memberName = `${member.firstName} ${member.lastName}`;
    const eventName = event.customLabel || event.eventLabel;
    const eventDate = new Date(event.eventDate);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background: #f9fafb; }
          .event-card { background: white; border-radius: 5px; padding: 15px; margin: 15px 0; border-left: 4px solid #1e40af; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Upcoming Celebration</h1>
          <p>PSN Taraba State Welfare Registry</p>
        </div>
        
        <div class="content">
          <p>Hello Pharmacist,</p>
          <p>This is a reminder about an upcoming celebration:</p>
          
          <div class="event-card">
            <h3>${eventName}</h3>
            <p><strong>Member:</strong> ${memberName}</p>
            <p><strong>Date:</strong> ${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> Tomorrow!</p>
          </div>
          
          <p>Please take a moment to reach out and celebrate with your colleague.</p>
          <p>Best regards,<br>PSN Taraba State Chapter Welfare Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from PSN Taraba Welfare System</p>
          <p>© ${new Date().getFullYear()} Pharmaceutical Society of Nigeria - Taraba State</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: member.email,
        subject: `🎉 Reminder: ${memberName}'s ${eventName} Tomorrow`,
        html: htmlContent,
        text: `Reminder: ${memberName}'s ${eventName} is tomorrow (${eventDate.toLocaleDateString()}). Please celebrate with your colleague!`
      });
      
      console.log(`✅ Email sent to ${member.email} (${info.messageId})`);
      
      // Log to database if you have an EmailLog model
      // await EmailLog.create({ memberId: member._id, eventId: event._id, messageId: info.messageId });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${member.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();