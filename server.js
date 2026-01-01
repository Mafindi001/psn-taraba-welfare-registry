// server.js - MINIMAL VERCEL-COMPATIBLE VERSION
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const app = express();

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(__dirname));

// ========== DATABASE SETUP ==========
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

// Initialize data directory
async function initDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✅ Data directory ready');
  } catch (error) {
    console.error('❌ Failed to create data directory:', error);
  }
}

// Initialize users file
async function initUsersFile() {
  try {
    await fs.access(USERS_FILE);
    console.log('📁 Users file exists');
  } catch {
    const initialData = { users: [], metadata: { createdAt: new Date().toISOString() } };
    await fs.writeFile(USERS_FILE, JSON.stringify(initialData, null, 2));
    console.log('📝 Created new users file');
  }
}

// Initialize admins file
async function initAdminsFile() {
  try {
    await fs.access(ADMINS_FILE);
    console.log('📁 Admins file exists');
  } catch {
    const defaultPassword = await bcrypt.hash('PSN@Taraba2025!', 10);
    const initialAdmins = {
      admins: [{
        id: 'admin-001',
        username: 'psnadmin',
        password: defaultPassword,
        fullName: 'PSN Taraba Admin',
        email: 'admin@psntaraba.org',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      }],
      metadata: { createdAt: new Date().toISOString() }
    };
    await fs.writeFile(ADMINS_FILE, JSON.stringify(initialAdmins, null, 2));
    console.log('🔐 Created default admin: psnadmin / PSN@Taraba2025!');
  }
}

// ========== DATABASE FUNCTIONS ==========
async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data).users || [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

async function saveUsers(users) {
  try {
    const dbData = { users, metadata: { lastUpdated: new Date().toISOString() } };
    await fs.writeFile(USERS_FILE, JSON.stringify(dbData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

async function getAdmins() {
  try {
    const data = await fs.readFile(ADMINS_FILE, 'utf8');
    return JSON.parse(data).admins || [];
  } catch (error) {
    console.error('Error reading admins:', error);
    return [];
  }
}

// ========== ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    service: 'PSN Taraba Welfare',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Page routes
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

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// ========== AUTH API ==========

// Member registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phoneNumber } = req.body;
    
    // Basic validation
    if (!fullName || !email || !password || !confirmPassword || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    // Check if user exists
    const users = await getUsers();
    const userExists = users.find(u => u.email === email.toLowerCase());
    
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      registrationDate: new Date().toISOString(),
      isVerified: false,
      userType: 'member'
    };
    
    users.push(newUser);
    await saveUsers(users);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Member login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    const users = await getUsers();
    const user = users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful!',
      user: userWithoutPassword,
      token: `user-${user.id}-${Date.now()}`
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    
    const admins = await getAdmins();
    const admin = admins.find(a => a.username === username);
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;
    
    res.json({
      success: true,
      message: 'Admin login successful!',
      admin: adminWithoutPassword,
      token: `admin-${admin.id}-${Date.now()}`
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========== ERROR HANDLERS ==========
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ========== INITIALIZE AND EXPORT ==========
async function initialize() {
  console.log('🔄 Initializing PSN Taraba Welfare Server...');
  try {
    await initDataDir();
    await initUsersFile();
    await initAdminsFile();
    console.log('✅ Server initialization complete');
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
  }
}

// Initialize on startup
initialize();

// Export for Vercel
module.exports = app;