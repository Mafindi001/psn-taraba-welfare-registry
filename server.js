// server.js - SIMPLIFIED FOR VERCEL
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const app = express();

// ========== MIDDLEWARE ==========
// CORS - Allow all origins for Vercel
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(__dirname));

// ========== JSON DATABASE SETUP ==========
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✅ Directories verified');
    return true;
  } catch (error) {
    console.error('❌ Directory creation error:', error);
    return false;
  }
}

// Initialize users file
async function initializeUsers() {
  try {
    await ensureDirectories();
    
    try {
      await fs.access(USERS_FILE);
      console.log('📁 Users file exists');
    } catch {
      const initialData = {
        users: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      await fs.writeFile(USERS_FILE, JSON.stringify(initialData, null, 2));
      console.log('📝 Created new users file');
    }
    return true;
  } catch (error) {
    console.error('❌ Users initialization error:', error);
    return false;
  }
}

// Initialize admins file with default admin
async function initializeAdmins() {
  try {
    await ensureDirectories();
    
    try {
      await fs.access(ADMINS_FILE);
      console.log('📁 Admins file exists');
    } catch {
      // Create default admin
      const defaultPassword = await bcrypt.hash('PSN@Taraba2025!', 12);
      const initialAdmins = {
        admins: [
          {
            id: 'admin-001',
            username: 'psnadmin',
            password: defaultPassword,
            fullName: 'PSN Taraba Admin',
            email: 'admin@psntaraba.org',
            role: 'superadmin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            permissions: ['all']
          }
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
      
      await fs.writeFile(ADMINS_FILE, JSON.stringify(initialAdmins, null, 2));
      console.log('🔐 Created default admin: psnadmin / PSN@Taraba2025!');
    }
    return true;
  } catch (error) {
    console.error('❌ Admins initialization error:', error);
    return false;
  }
}

// ========== DATABASE FUNCTIONS ==========
async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.users || [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

async function saveUsers(users) {
  try {
    const dbData = {
      users,
      metadata: {
        lastUpdated: new Date().toISOString(),
        userCount: users.length
      }
    };
    await fs.writeFile(USERS_FILE, JSON.stringify(dbData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users file:', error);
    return false;
  }
}

async function getAdmins() {
  try {
    const data = await fs.readFile(ADMINS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.admins || [];
  } catch (error) {
    console.error('Error reading admins file:', error);
    return [];
  }
}

// ========== PAGE ROUTES ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'PSN Taraba Welfare Registry',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== AUTH API ROUTES ==========

// Member registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      dateOfBirth,
      psnMembershipNumber,
      psnYearOfInduction,
      placeOfWork,
      residentialAddress,
      localGovernment,
      nextOfKin,
      dataConsent
    } = req.body;

    console.log('📝 Registration attempt for:', email);

    // Basic validation
    const errors = [];

    if (!fullName || fullName.trim().length < 3) {
      errors.push({ field: 'fullName', message: 'Full name is required and must be at least 3 characters' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!phoneNumber) {
      errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
    }

    if (!password || password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    if (!psnMembershipNumber) {
      errors.push({ field: 'psnMembershipNumber', message: 'PSN membership number is required' });
    }

    if (!localGovernment) {
      errors.push({ field: 'localGovernment', message: 'Local government is required' });
    }

    if (!nextOfKin?.name) {
      errors.push({ field: 'nextOfKinName', message: 'Next of kin name is required' });
    }

    if (!dataConsent) {
      errors.push({ field: 'dataConsent', message: 'Data consent is required' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if user already exists
    const users = await getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    
    const userExists = users.find(u => u.email === normalizedEmail);

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth || '',
      psnMembershipNumber: psnMembershipNumber ? psnMembershipNumber.toUpperCase().trim() : '',
      psnYearOfInduction: psnYearOfInduction ? parseInt(psnYearOfInduction) : null,
      placeOfWork: placeOfWork ? placeOfWork.trim() : '',
      residentialAddress: residentialAddress ? residentialAddress.trim() : '',
      localGovernment: localGovernment || '',
      nextOfKin: nextOfKin || { name: '', relationship: '', phoneNumber: '' },
      dataConsent: !!dataConsent,
      registrationDate: new Date().toISOString(),
      isVerified: false,
      userType: 'member',
      lastLogin: null,
      status: 'active'
    };

    // Save to database
    users.push(newUser);
    await saveUsers(users);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    console.log('✅ User registered successfully:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Member login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Member login attempt:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get users from database
    const users = await getUsers();
    
    // Find user
    const user = users.find(u => u.email === email.toLowerCase().trim());
    
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await saveUsers(users);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful:', user.email);

    res.json({
      success: true,
      message: 'Login successful!',
      user: userWithoutPassword,
      token: `user-${user.id}-${Date.now()}`
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔑 Admin login attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const admins = await getAdmins();
    const admin = admins.find(a => a.username === username);
    
    if (!admin) {
      console.log('❌ Admin login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.log('❌ Admin login failed: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;
    
    console.log('✅ Admin login successful:', username);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      admin: adminWithoutPassword,
      token: `admin-${admin.id}-${Date.now()}`
    });
    
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ========== ERROR HANDLERS ==========
// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ========== VERCEL COMPATIBILITY ==========
// Initialize databases when the server starts
async function initializeServer() {
  console.log('🔄 Initializing server...');
  await initializeUsers();
  await initializeAdmins();
  console.log('✅ Server initialization complete');
}

// Initialize and export for Vercel
initializeServer().then(() => {
  console.log('🚀 Server is ready for Vercel');
}).catch(error => {
  console.error('❌ Server initialization failed:', error);
});

// Export the app for Vercel
module.exports = app;