// test-email.js
// Test email configuration

require('dotenv').config();
const { sendEmail } = require('./config/email');

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  // Get email from environment
  const recipientEmail = process.env.EMAIL_USER;
  
  console.log('📧 Recipient email:', recipientEmail);
  console.log('📧 From email:', process.env.EMAIL_FROM);
  console.log('');
  
  if (!recipientEmail) {
    console.error('❌ EMAIL_USER not set in .env file');
    process.exit(1);
  }

  try {
    const emailOptions = {
      to: recipientEmail,
      subject: 'PSN Welfare System - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">✅ Email Configuration Successful!</h1>
          <p style="font-size: 16px; line-height: 1.6;">
            Your PSN Taraba Welfare System email service is working correctly.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            You can now send automated reminders.
          </p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 14px; color: #6b7280;">
            This is a test email from PSN Taraba State Welfare Registry
          </p>
        </div>
      `,
      text: 'Email Configuration Successful! Your PSN Taraba Welfare System email service is working correctly.'
    };

    console.log('📤 Attempting to send test email...\n');

    const result = await sendEmail(emailOptions);
    
    console.log('\n✅ TEST SUCCESSFUL!');
    console.log('📧 Check your inbox:', recipientEmail);
    console.log('📬 Message ID:', result.messageId);
    console.log('\n🎉 Email service is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ EMAIL TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. EMAIL_USER in .env is correct:', process.env.EMAIL_USER);
    console.error('2. EMAIL_PASSWORD is the 16-character app password');
    console.error('3. EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length, '(should be 16)');
    console.error('4. 2-Step Verification is enabled on your Gmail account');
    console.error('5. App password was generated recently');
    process.exit(1);
  }
}

// Run test
testEmail();