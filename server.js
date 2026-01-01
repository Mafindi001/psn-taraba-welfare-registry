// server.js - FINAL VERCEL-OPTIMIZED VERSION
console.log('🚀 PSN Taraba Welfare System - Vercel Deployment');

// Import core modules
const path = require('path');

// Import dependencies with error handling
let express, cors, fs, bcrypt;
try {
  express = require('express');
  cors = require('cors');
  fs = require('fs').promises;
  bcrypt = require('bcrypt');
  console.log('✅ Dependencies loaded successfully');
} catch (error) {
  console.error('❌ Failed to load dependencies:', error.message);
  process.exit(1);
}

const app = express();

// ========== CONFIGURATION ==========
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_URL;
const PORT = process.env.PORT || 3000;

// ========== FILE PATHS ==========
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const WELFARE_FILE = path.join(DATA_DIR, 'welfare.json');

// ========== MIDDLEWARE ==========
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

// ========== DATABASE INITIALIZATION ==========
async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Create data directory
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize users file
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify({ users: [], metadata: { createdAt: new Date().toISOString() } }, null, 2));
      console.log('📝 Created users.json');
    }
    
    // Initialize admins file
    try {
      await fs.access(ADMINS_FILE);
    } catch {
      const hashedPassword = await bcrypt.hash('PSN@Taraba2025!', 10);
      const adminsData = {
        admins: [{
          id: 'admin-001',
          username: 'psnadmin',
          password: hashedPassword,
          fullName: 'PSN Taraba Admin',
          email: 'admin@psntaraba.org',
          role: 'superadmin',
          createdAt: new Date().toISOString()
        }],
        metadata: { createdAt: new Date().toISOString() }
      };
      await fs.writeFile(ADMINS_FILE, JSON.stringify(adminsData, null, 2));
      console.log('🔐 Created admins.json with default admin');
    }
    
    // Initialize welfare file
    try {
      await fs.access(WELFARE_FILE);
    } catch {
      const welfareData = {
        packages: [{
          id: 'welfare-001',
          name: '2024 End of Year Package',
          type: 'food_items',
          description: 'Rice, oil, and other food items',
          value: 25000,
          eligibility: 'All verified members',
          distributionDate: '2024-12-20',
          status: 'completed'
        }],
        metadata: { createdAt: new Date().toISOString() }
      };
      await fs.writeFile(WELFARE_FILE, JSON.stringify(welfareData, null, 2));
      console.log('💰 Created welfare.json');
    }
    
    console.log('✅ Database initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// ========== DATABASE FUNCTIONS ==========
async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data).users || [];
  } catch (error) {
    console.error('Error reading users:', error.message);
    return [];
  }
}

async function saveUsers(users) {
  try {
    const data = { users, metadata: { lastUpdated: new Date().toISOString() } };
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error.message);
    return false;
  }
}

async function getAdmins() {
  try {
    const data = await fs.readFile(ADMINS_FILE, 'utf8');
    return JSON.parse(data).admins || [];
  } catch (error) {
    console.error('Error reading admins:', error.message);
    return [];
  }
}

async function getWelfarePackages() {
  try {
    const data = await fs.readFile(WELFARE_FILE, 'utf8');
    return JSON.parse(data).packages || [];
  } catch (error) {
    console.error('Error reading welfare:', error.message);
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

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

// ========== API ROUTES ==========
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'PSN Taraba Welfare',
    timestamp: new Date().toISOString(),
    environment: IS_VERCEL ? 'vercel' : 'local'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Member registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phoneNumber } = req.body;
    
    if (!fullName || !email || !password || !confirmPassword || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    const users = await getUsers();
    const userExists = users.find(u => u.email === email.toLowerCase());
    
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
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

// Get all members (admin)
app.get('/api/admin/members', async (req, res) => {
  try {
    const users = await getUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      members: usersWithoutPasswords,
      count: usersWithoutPasswords.length
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get welfare packages
app.get('/api/welfare', async (req, res) => {
  try {
    const packages = await getWelfarePackages();
    
    res.json({
      success: true,
      packages: packages
    });
  } catch (error) {
    console.error('Error fetching welfare:', error);
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

// ========== INITIALIZATION ==========
async function startServer() {
  console.log('🔄 Starting server initialization...');
  
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    console.error('❌ Failed to initialize database');
    return;
  }
  
  console.log('✅ Server initialization complete');
  
  // If not on Vercel, start local server
  if (!IS_VERCEL) {
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log('📁 Available Pages:');
      console.log(`   Home: http://localhost:${PORT}/`);
      console.log(`   Register: http://localhost:${PORT}/register`);
      console.log(`   Login: http://localhost:${PORT}/login`);
      console.log(`   Admin Login: http://localhost:${PORT}/admin-login`);
      console.log('='.repeat(60) + '\n');
    });
  }
}

// Start initialization
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
});

// Export for Vercel
if (IS_VERCEL) {
  console.log('🚀 Exporting app for Vercel serverless...');
  module.exports = app;
}