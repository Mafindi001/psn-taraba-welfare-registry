// test-email-reminders.js
require('dotenv').config();

console.log('🧪 Testing PSN Taraba Email Reminder System\n');
console.log('Current directory:', __dirname);

// First, let's check what files exist
const fs = require('fs');
const path = require('path');

console.log('\n📁 Checking project structure...');

// Check for key files
const filesToCheck = [
  '.env',
  'package.json',
  'services/emailService.js',
  'services/reminderScheduler.js',
  'models/member.model.js',
  'models/specialDate.model.js'
];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  console.log(`${fs.existsSync(fullPath) ? '✅' : '❌'} ${file}`);
});

// Check .env content (safely)
console.log('\n🔐 Checking .env variables...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('✅ .env file exists');
  
  // Load .env manually to check
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const hasEmailUser = envContent.includes('EMAIL_USER');
  const hasEmailPass = envContent.includes('EMAIL_PASSWORD');
  
  console.log(`   EMAIL_USER defined: ${hasEmailUser ? '✅' : '❌'}`);
  console.log(`   EMAIL_PASSWORD defined: ${hasEmailPass ? '✅' : '❌'}`);
  
  if (!hasEmailUser || !hasEmailPass) {
    console.log('\n⚠️  Please add to .env file:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-16-character-app-password');
    console.log('\nGet app password from: https://myaccount.google.com/apppasswords');
  }
} else {
  console.log('❌ No .env file found');
}

// Test basic Node.js functionality
console.log('\n🧪 Testing basic imports...');
try {
  // Try to load nodemailer
  const nodemailer = require('nodemailer');
  console.log('✅ nodemailer module loaded');
} catch (error) {
  console.log('❌ nodemailer not installed');
  console.log('   Run: npm install nodemailer node-cron dotenv');
}

// Check package.json for dependencies
console.log('\n📦 Checking package.json...');
if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  try {
    const pkg = require('./package.json');
    const deps = pkg.dependencies || {};
    
    console.log(`   nodemailer: ${deps.nodemailer ? '✅' : '❌'}`);
    console.log(`   node-cron: ${deps['node-cron'] ? '✅' : '❌'}`);
    console.log(`   dotenv: ${deps.dotenv ? '✅' : '❌'}`);
    
    if (!deps.nodemailer || !deps['node-cron'] || !deps.dotenv) {
      console.log('\n⚠️  Missing dependencies. Run:');
      console.log('npm install nodemailer node-cron dotenv');
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
  }
}

console.log('\n✅ Diagnostic complete!');
console.log('\n📋 Next steps:');
console.log('1. Ensure .env has email credentials');
console.log('2. Install missing dependencies');
console.log('3. Fix import paths in your files');
console.log('4. Run: node server.js to start the system');