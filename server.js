// server.js - FIXED FOR VERCEL DEPLOYMENT WITH CORRECT URL
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000; // Changed from 5000 to 3000 for Vercel compatibility

console.log('🚀 Starting PSN Taraba Welfare System...');
console.log('📅', new Date().toISOString());
console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 Vercel:', process.env.VERCEL ? 'Yes' : 'No');

// ========== VERCEL-SPECIFIC CONFIGURATION ==========
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL;
const isProduction = process.env.NODE_ENV === 'production';

// ========== MIDDLEWARE ==========
// Configure CORS for production - SIMPLIFIED for Vercel
if (isProduction || isVercel) {
  app.use(cors({
    origin: true, // Allow all origins in production (Vercel handles this)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
  }));
} else {
  // Local development - allow all
  app.use(cors({
    origin: true,
    credentials: true
  }));
}

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from views directory - FIXED PATH FOR VERCEL
const viewsPath = path.join(__dirname, 'views');
console.log('📁 Views path:', viewsPath);
app.use(express.static(viewsPath));

// Also serve from root for Vercel compatibility
app.use(express.static(__dirname));

// ========== JSON DATABASE SETUP ==========
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const WELFARE_FILE = path.join(DATA_DIR, 'welfare.json');
const LOGS_DIR = path.join(__dirname, 'logs');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(LOGS_DIR, { recursive: true });
    console.log('✅ Directories verified');
    return true;
  } catch (error) {
    console.error('❌ Directory creation error:', error);
    return false;
  }
}

// Initialize users file
async function initializeDatabase() {
  try {
    await ensureDirectories();
    
    try {
      await fs.access(USERS_FILE);
      console.log('📁 Users database file exists');
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
      console.log('📝 Created new users database file');
    }
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
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
      // Create default admin: psnadmin with secure password
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
    console.error('❌ Admin initialization error:', error);
    return false;
  }
}

// Initialize welfare file
async function initializeWelfare() {
  try {
    await ensureDirectories();
    
    try {
      await fs.access(WELFARE_FILE);
      console.log('📁 Welfare file exists');
    } catch {
      const initialWelfare = {
        packages: [
          {
            id: 'welfare-001',
            name: '2024 End of Year Package',
            type: 'food_items',
            description: 'Rice, oil, and other food items for members',
            value: 25000,
            eligibility: 'All verified members',
            distributionDate: '2024-12-20',
            status: 'completed',
            createdAt: '2024-11-15T00:00:00.000Z',
            beneficiaries: [],
            distributionLog: []
          },
          {
            id: 'welfare-002',
            name: '2025 Q1 Medical Support',
            type: 'healthcare',
            description: 'Health insurance premium support',
            value: 15000,
            eligibility: 'Active members with 2+ years membership',
            distributionDate: '2025-03-15',
            status: 'planned',
            createdAt: new Date().toISOString(),
            beneficiaries: [],
            distributionLog: []
          }
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
      await fs.writeFile(WELFARE_FILE, JSON.stringify(initialWelfare, null, 2));
      console.log('💰 Created welfare database with sample packages');
    }
    return true;
  } catch (error) {
    console.error('❌ Welfare initialization error:', error);
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

async function saveAdmins(admins) {
  try {
    const adminData = {
      admins,
      metadata: {
        lastUpdated: new Date().toISOString(),
        adminCount: admins.length
      }
    };
    await fs.writeFile(ADMINS_FILE, JSON.stringify(adminData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving admins file:', error);
    return false;
  }
}

async function getWelfarePackages() {
  try {
    const data = await fs.readFile(WELFARE_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.packages || [];
  } catch (error) {
    console.error('Error reading welfare file:', error);
    return [];
  }
}

async function saveWelfarePackages(packages) {
  try {
    const welfareData = {
      packages,
      metadata: {
        lastUpdated: new Date().toISOString(),
        packageCount: packages.length
      }
    };
    await fs.writeFile(WELFARE_FILE, JSON.stringify(welfareData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving welfare file:', error);
    return false;
  }
}

// ========== PAGE ROUTES ==========
app.get('/', (req, res) => {
  console.log(`🌐 Home page requested from: ${req.headers.origin || 'Unknown origin'}`);
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/register', (req, res) => {
  console.log(`📝 Register page requested from: ${req.headers.origin || 'Unknown origin'}`);
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
  console.log(`🔑 Login page requested from: ${req.headers.origin || 'Unknown origin'}`);
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin-login', (req, res) => {
  console.log(`👑 Admin login page requested from: ${req.headers.origin || 'Unknown origin'}`);
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

app.get('/dashboard', (req, res) => {
  console.log(`📊 Dashboard requested from: ${req.headers.origin || 'Unknown origin'}`);
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  console.log(`👑 Admin dashboard requested from: ${req.headers.origin || 'Unknown origin'}`);
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'PSN Taraba Welfare Registry',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    isVercel: isVercel,
    vercelUrl: process.env.VERCEL_URL || 'Not on Vercel',
    nodeVersion: process.version
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

    console.log('📝 Registration attempt for:', email, 'from:', req.headers.origin);

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
      message: 'Server error during registration: ' + error.message
    });
  }
});

// Member login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Member login attempt:', email, 'from:', req.headers.origin);

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

// ========== ADMIN API ROUTES ==========

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔑 Admin login attempt:', username, 'from:', req.headers.origin);
    
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
    
    // Update last login
    admin.lastLogin = new Date().toISOString();
    await saveAdmins(admins);
    
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

// ========== INITIALIZE AND START SERVER ==========

// Initialize function
async function initializeServer() {
  try {
    console.log('🔄 Initializing server...');
    await initializeDatabase();
    await initializeAdmins();
    await initializeWelfare();
    console.log('✅ Server initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    return false;
  }
}

// Global error handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ========== VERCEL COMPATIBILITY ==========
// This is CRITICAL for Vercel - export the app as a serverless function
if (isVercel) {
  console.log('🚀 Configuring for Vercel serverless deployment...');
  // Initialize on cold start
  initializeServer().then(() => {
    console.log('✅ Vercel serverless function ready');
  });
  
  // Export for Vercel
  module.exports = app;
} else {
  // Local development
  console.log('💻 Running in local development mode...');
  
  // Start server locally
  async function startLocalServer() {
    await initializeServer();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(60));
      console.log('✅ SERVER STARTED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Default admin: psnadmin / PSN@Taraba2025!`);
      console.log('='.repeat(60));
      console.log('\n🌐 Available Pages:');
      console.log(`   Home: http://localhost:${PORT}/`);
      console.log(`   Register: http://localhost:${PORT}/register`);
      console.log(`   Login: http://localhost:${PORT}/login`);
      console.log(`   Admin Login: http://localhost:${PORT}/admin-login`);
      console.log('='.repeat(60) + '\n');
    });
  }
  
  startLocalServer();
}