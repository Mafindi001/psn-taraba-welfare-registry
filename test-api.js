// test-api.js - Test all API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`\n🔍 Testing ${method} ${endpoint}...`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Response:`, JSON.stringify(result, null, 2));
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('='.repeat(50));

  // Test 1: Health endpoint
  await testEndpoint('GET', '/health');

  // Test 2: Test endpoint
  await testEndpoint('GET', '/test');

  // Test 3: Admin login (with correct credentials)
  await testEndpoint('POST', '/admin/login', {
    username: 'psnadmin',
    password: 'PSN@Taraba2025!'
  });

  // Test 4: Admin login (with wrong credentials)
  await testEndpoint('POST', '/admin/login', {
    username: 'psnadmin',
    password: 'wrongpassword'
  });

  // Test 5: Get admin stats
  await testEndpoint('GET', '/admin/stats');

  // Test 6: Get all members (admin)
  await testEndpoint('GET', '/admin/members');

  // Test 7: Test non-existent endpoint
  await testEndpoint('GET', '/nonexistent');

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
}

// Run tests
runAllTests();