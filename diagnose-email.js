require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES CHECK ===\n');

console.log('Raw .env values:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

console.log('\n=== CONFIG MODULE CHECK ===\n');

try {
  const config = require('./config/environment');
  console.log('Config loaded successfully!');
  console.log('config.email:', JSON.stringify(config.email, null, 2));
} catch (error) {
  console.error('Failed to load config:', error.message);
}

console.log('\n=== NODEMAILER CHECK ===\n');

try {
  const nodemailer = require('nodemailer');
  console.log('Nodemailer loaded successfully');
  
  const testTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  console.log('Transporter created');
  
  testTransporter.verify((error, success) => {
    if (error) {
      console.error('❌ Verification failed:', error.message);
    } else {
      console.log('✅ Verification successful!');
    }
  });
  
} catch (error) {
  console.error('Failed to create transporter:', error.message);
}