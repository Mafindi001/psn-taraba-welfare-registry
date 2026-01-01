// config/email.js
// Email service configuration using Nodemailer

const nodemailer = require('nodemailer');

// Load environment variables directly
require('dotenv').config();

console.log('\n=== EMAIL SERVICE INITIALIZATION ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Validate configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ EMAIL_USER or EMAIL_PASSWORD not set in .env');
  module.exports = {
    sendEmail: async () => {
      throw new Error('Email service not configured - missing credentials');
    },
    sendBulkEmails: async () => {
      throw new Error('Email service not configured - missing credentials');
    },
    testEmailConfig: async () => {
      throw new Error('Email service not configured - missing credentials');
    },
    transporter: null
  };
} else {
  console.log('✅ Email credentials found');

  // Create transporter
  let transporter;
  
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Transporter created');

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email verification failed:', error.message);
      } else {
        console.log('✅ Email service ready to send messages');
      }
    });

  } catch (error) {
    console.error('❌ Failed to create transporter:', error.message);
    transporter = null;
  }

  /**
   * Send email
   */
  const sendEmail = async (mailOptions) => {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    if (!mailOptions.to) {
      throw new Error('No recipient email address provided');
    }

    console.log('\n📤 Sending email...');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text || ''
      });

      console.log('✅ Email sent!');
      console.log('Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  };

  /**
   * Send bulk emails
   */
  const sendBulkEmails = async (emails) => {
    const results = [];

    for (const email of emails) {
      try {
        const result = await sendEmail(email);
        results.push({
          email: email.to,
          success: true,
          messageId: result.messageId
        });

        // Delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          email: email.to,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  };

  /**
   * Test email configuration
   */
  const testEmailConfig = async () => {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      await transporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      throw new Error(`Email configuration test failed: ${error.message}`);
    }
  };

  module.exports = {
    sendEmail,
    sendBulkEmails,
    testEmailConfig,
    transporter
  };
}