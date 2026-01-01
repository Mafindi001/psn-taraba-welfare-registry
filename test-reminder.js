// test-email-reminders.js (place in project root)
require('dotenv').config();

async function testCompleteSystem() {
  console.log('🧪 Testing Complete Email Reminder System\n');
  
  // Test 1: Check environment variables
  console.log('1. Checking environment...');
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Missing email credentials in .env file');
    console.log('   Please add:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASSWORD=your-gmail-app-password');
    return;
  }
  console.log('✅ .env configuration found');
  
  // Test 2: Test email service directly
  console.log('\n2. Testing email service...');
  const emailService = require('./services/emailService');
  const testResult = await emailService.verifyConnection();
  
  if (!testResult) {
    console.log('❌ Email service connection failed');
    console.log('\nCommon fixes:');
    console.log('1. Enable 2FA in Google Account');
    console.log('2. Generate App Password (not regular password)');
    console.log('3. Allow less secure apps (temporarily)');
    return;
  }
  console.log('✅ Email service connected');
  
  // Test 3: Send test email
  console.log('\n3. Sending test email...');
  const testEmail = await emailService.sendReminder(
    {
      firstName: 'Test',
      lastName: 'User',
      email: process.env.EMAIL_USER
    },
    {
      eventLabel: 'Test Celebration',
      eventDate: new Date(),
      customLabel: null
    }
  );
  
  if (testEmail.success) {
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox at:', process.env.EMAIL_USER);
  } else {
    console.log('❌ Test email failed:', testEmail.error);
  }
  
  console.log('\n✅ All tests completed');
  process.exit(0);
}

// Run the test
testCompleteSystem().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});