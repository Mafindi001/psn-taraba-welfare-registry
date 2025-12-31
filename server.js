// server.js - COMPLETE VERSION WITH ADMIN ENDPOINTS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting PSN Taraba Welfare System...');
console.log('📅', new Date().toISOString());

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));

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
  } catch (error) {
    console.error('❌ Directory creation error:', error);
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
  } catch (error) {
    console.error('❌ Database initialization error:', error);
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
  } catch (error) {
    console.error('❌ Admin initialization error:', error);
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
  } catch (error) {
    console.error('❌ Welfare initialization error:', error);
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

// ========== PUBLIC API ROUTES ==========
console.log('📂 Setting up API routes...');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'PSN Taraba Welfare Registry',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Get user by ID (public)
app.get('/api/users/:id', async (req, res) => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
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
      message: 'Server error during registration: ' + error.message
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

// ========== ADMIN API ROUTES ==========

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

// Admin change password
app.post('/api/admin/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }
    
    const admins = await getAdmins();
    const adminIndex = admins.findIndex(a => a.username === username);
    
    if (adminIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, admins[adminIndex].password);
    
    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admins[adminIndex].password = hashedPassword;
    admins[adminIndex].passwordChangedAt = new Date().toISOString();
    
    await saveAdmins(admins);
    
    console.log('✅ Admin password changed:', username);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// Get all members (admin only)
app.get('/api/admin/members', async (req, res) => {
  try {
    const users = await getUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      members: usersWithoutPasswords,
      count: usersWithoutPasswords.length,
      stats: {
        active: users.filter(u => u.status === 'active').length,
        verified: users.filter(u => u.isVerified).length,
        newThisMonth: users.filter(u => {
          const regDate = new Date(u.registrationDate);
          const now = new Date();
          return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
        }).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get member by ID (admin only)
app.get('/api/admin/members/:id', async (req, res) => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Remove password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      member: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update member (admin only)
app.put('/api/admin/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Update user
    users[userIndex] = { ...users[userIndex], ...updates };
    await saveUsers(users);
    
    const { password, ...userWithoutPassword } = users[userIndex];
    
    res.json({
      success: true,
      message: 'Member updated successfully',
      member: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete member (admin only)
app.delete('/api/admin/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Remove user (or mark as deleted)
    const deletedUser = users.splice(userIndex, 1)[0];
    await saveUsers(users);
    
    console.log('🗑️ Admin deleted member:', deletedUser.email);
    
    res.json({
      success: true,
      message: 'Member deleted successfully',
      deletedMember: {
        id: deletedUser.id,
        email: deletedUser.email,
        fullName: deletedUser.fullName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify member (admin only)
app.post('/api/admin/members/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    users[userIndex].isVerified = true;
    users[userIndex].verifiedAt = new Date().toISOString();
    users[userIndex].verifiedBy = req.body.verifiedBy || 'admin';
    
    await saveUsers(users);
    
    res.json({
      success: true,
      message: 'Member verified successfully',
      member: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        fullName: users[userIndex].fullName,
        isVerified: users[userIndex].isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get system statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const users = await getUsers();
    const admins = await getAdmins();
    const welfarePackages = await getWelfarePackages();
    
    // Calculate various stats
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const stats = {
      totalMembers: users.length,
      verifiedMembers: users.filter(u => u.isVerified).length,
      activeMembers: users.filter(u => u.status === 'active').length,
      newMembersThisMonth: users.filter(u => {
        const regDate = new Date(u.registrationDate);
        return regDate.getMonth() === thisMonth && regDate.getFullYear() === thisYear;
      }).length,
      totalAdmins: admins.length,
      welfarePackages: welfarePackages.length,
      activeWelfarePackages: welfarePackages.filter(p => p.status === 'active').length,
      membersByLGA: {},
      membersByYear: {}
    };
    
    // Count by Local Government
    users.forEach(user => {
      if (user.localGovernment) {
        stats.membersByLGA[user.localGovernment] = (stats.membersByLGA[user.localGovernment] || 0) + 1;
      }
      
      // Count by induction year
      if (user.psnYearOfInduction) {
        stats.membersByYear[user.psnYearOfInduction] = (stats.membersByYear[user.psnYearOfInduction] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      stats,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  console.log('👋 Admin logout request');
  res.json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

// General logout (for both members and admins)
app.post('/api/auth/logout', (req, res) => {
  console.log('👋 Logout request');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ========== WELFARE API ENDPOINTS ==========

// Get all welfare packages (admin only)
app.get('/api/admin/welfare', async (req, res) => {
  try {
    const packages = await getWelfarePackages();
    res.json({
      success: true,
      packages,
      count: packages.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get welfare package by ID (admin only)
app.get('/api/admin/welfare/:id', async (req, res) => {
  try {
    const packages = await getWelfarePackages();
    const packageItem = packages.find(p => p.id === req.params.id);
    
    if (!packageItem) {
      return res.status(404).json({
        success: false,
        message: 'Welfare package not found'
      });
    }
    
    res.json({
      success: true,
      package: packageItem
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new welfare package (admin only)
app.post('/api/admin/welfare', async (req, res) => {
  try {
    const { name, type, description, value, eligibility, distributionDate, status } = req.body;
    
    if (!name || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and description are required'
      });
    }
    
    const packages = await getWelfarePackages();
    
    const newPackage = {
      id: `welfare-${Date.now()}`,
      name,
      type,
      description,
      value: value || 0,
      eligibility: eligibility || 'All verified members',
      distributionDate: distributionDate || null,
      status: status || 'planned',
      createdAt: new Date().toISOString(),
      beneficiaries: [],
      distributionLog: []
    };
    
    packages.push(newPackage);
    await saveWelfarePackages(packages);
    
    res.status(201).json({
      success: true,
      message: 'Welfare package created successfully',
      package: newPackage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update welfare package (admin only)
app.put('/api/admin/welfare/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const packages = await getWelfarePackages();
    const packageIndex = packages.findIndex(p => p.id === id);
    
    if (packageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Welfare package not found'
      });
    }
    
    packages[packageIndex] = { ...packages[packageIndex], ...updates };
    await saveWelfarePackages(packages);
    
    res.json({
      success: true,
      message: 'Welfare package updated successfully',
      package: packages[packageIndex]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete welfare package (admin only)
app.delete('/api/admin/welfare/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const packages = await getWelfarePackages();
    const packageIndex = packages.findIndex(p => p.id === id);
    
    if (packageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Welfare package not found'
      });
    }
    
    const deletedPackage = packages.splice(packageIndex, 1)[0];
    await saveWelfarePackages(packages);
    
    res.json({
      success: true,
      message: 'Welfare package deleted successfully',
      deletedPackage: {
        id: deletedPackage.id,
        name: deletedPackage.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get welfare packages for members (public endpoint)
app.get('/api/welfare', async (req, res) => {
  try {
    const packages = await getWelfarePackages();
    
    // Filter out sensitive info for public view
    const publicPackages = packages.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description,
      distributionDate: p.distributionDate,
      status: p.status
    }));
    
    res.json({
      success: true,
      packages: publicPackages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========== ERROR HANDLERS ==========
// API 404 handler
app.use('/api/*', (req, res) => {
  console.log(`❌ API endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global 404 handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>404 Not Found</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #dc2626; }
              a { color: #1e40af; text-decoration: none; }
          </style>
      </head>
      <body>
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <p><a href="/">Go back home</a></p>
      </body>
      </html>
    `);
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Not found' 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ========== START SERVER ==========
async function startServer() {
  try {
    // Initialize all databases
    await initializeDatabase();
    await initializeAdmins();
    await initializeWelfare();
    
    // Get initial counts
    const users = await getUsers();
    const admins = await getAdmins();
    const welfarePackages = await getWelfarePackages();
    
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('✅ SERVER STARTED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`📁 Database: ${USERS_FILE}`);
      console.log(`📁 Admins: ${ADMINS_FILE}`);
      console.log(`💰 Welfare: ${WELFARE_FILE}`);
      console.log(`👥 Registered users: ${users.length}`);
      console.log(`👑 Admin accounts: ${admins.length}`);
      console.log(`📦 Welfare packages: ${welfarePackages.length}`);
      console.log(`🔐 Default admin: psnadmin / PSN@Taraba2025!`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log('\n🌐 Available Pages:');
      console.log(`   Home: http://localhost:${PORT}/`);
      console.log(`   Register: http://localhost:${PORT}/register`);
      console.log(`   Login: http://localhost:${PORT}/login`);
      console.log(`   Admin Login: http://localhost:${PORT}/admin-login`);
      console.log(`   Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`   Admin Dashboard: http://localhost:${PORT}/admin-dashboard`);
      console.log('='.repeat(60));
      console.log('\n🔗 API Endpoints:');
      console.log(`   Health: GET http://localhost:${PORT}/api/health`);
      console.log(`   Test: GET http://localhost:${PORT}/api/test`);
      console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   Admin Login: POST http://localhost:${PORT}/api/admin/login`);
      console.log(`   Admin Stats: GET http://localhost:${PORT}/api/admin/stats`);
      console.log(`   Admin Members: GET http://localhost:${PORT}/api/admin/members`);
      console.log(`   Welfare Packages: GET http://localhost:${PORT}/api/welfare`);
      console.log('='.repeat(60) + '\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received. Shutting down...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
