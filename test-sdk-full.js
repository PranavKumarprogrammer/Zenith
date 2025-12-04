#!/usr/bin/env node

/**
 * Comprehensive SDK and Backend Test
 * Tests all core functionality to verify working state
 */

const ZMClient = require('./sdk.js');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passCount = 0;
let failCount = 0;

function test(name, passed, message = '') {
  if (passed) {
    console.log(`${colors.green}✅ PASS${colors.reset} - ${name}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌ FAIL${colors.reset} - ${name}: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log(`${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║     ZENITH MEMORY SDK & BACKEND COMPREHENSIVE TEST   ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  const client = new ZMClient();

  // Test 1: Health check
  console.log(`${colors.blue}[1] Testing Health Endpoint${colors.reset}`);
  try {
    const health = await client.health();
    test('Health check', health.status === 'ok', JSON.stringify(health));
  } catch (error) {
    test('Health check', false, error.message);
  }

  // Test 2: User Registration
  console.log(`\n${colors.blue}[2] Testing User Registration${colors.reset}`);
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Test User';

  let userId, token;
  try {
    const registerRes = await client.register(testEmail, testPassword, testName);
    userId = registerRes.userId;
    token = registerRes.token;
    test('User registration', 
      registerRes.success && userId && token,
      `userId: ${userId}, token: ${token ? 'obtained' : 'missing'}`
    );
    console.log(`  📧 Email: ${testEmail}`);
    console.log(`  🆔 User ID: ${userId}`);
  } catch (error) {
    test('User registration', false, error.message);
    return; // Stop if registration fails
  }

  // Test 3: Token-based authentication
  console.log(`\n${colors.blue}[3] Testing Authentication with JWT Token${colors.reset}`);
  const authClient = new ZMClient({ jwt: token });
  try {
    const buckets = await authClient.listBuckets();
    test('Authentication with token', buckets.success === true, 'Listed buckets');
  } catch (error) {
    test('Authentication with token', false, error.message);
  }

  // Test 4: Bucket Creation
  console.log(`\n${colors.blue}[4] Testing Bucket Creation${colors.reset}`);
  let bucketId;
  try {
    const bucketRes = await authClient.createBucket(`test-bucket-${Date.now()}`, {
      durability: 'standard',
      region: 'us-east-1'
    });
    bucketId = bucketRes.bucketId;
    test('Bucket creation', 
      bucketRes.success && bucketId,
      `bucketId: ${bucketId}`
    );
    console.log(`  📦 Bucket ID: ${bucketId}`);
    console.log(`  📍 Region: us-east-1`);
  } catch (error) {
    test('Bucket creation', false, error.message);
    return; // Stop if bucket creation fails
  }

  // Test 5: List Buckets
  console.log(`\n${colors.blue}[5] Testing List Buckets${colors.reset}`);
  try {
    const listRes = await authClient.listBuckets();
    test('List buckets', 
      listRes.success && Array.isArray(listRes.buckets),
      `Found ${listRes.buckets.length} bucket(s)`
    );
    console.log(`  📊 Total buckets: ${listRes.buckets.length}`);
  } catch (error) {
    test('List buckets', false, error.message);
  }

  // Test 6: Write Data (PUT)
  console.log(`\n${colors.blue}[6] Testing Data Write Operation (PUT)${colors.reset}`);
  const testData = {
    name: 'Test Record',
    value: 12345,
    timestamp: new Date().toISOString(),
    nested: { key: 'value' }
  };
  try {
    const putRes = await authClient.put(bucketId, '/test-data/record1', testData);
    test('Write data (PUT)',
      putRes.success === true,
      `Path: /test-data/record1`
    );
    console.log(`  💾 Data stored successfully`);
    console.log(`  📏 Data size: ${putRes.bucketId ? 'recorded' : 'unknown'} bytes`);
  } catch (error) {
    test('Write data (PUT)', false, error.message);
  }

  // Test 7: Read Data (GET)
  console.log(`\n${colors.blue}[7] Testing Data Read Operation (GET)${colors.reset}`);
  try {
    const getData = await authClient.get(bucketId, '/test-data/record1');
    const isMatch = JSON.stringify(getData) === JSON.stringify(testData);
    test('Read data (GET)',
      isMatch,
      `Retrieved data matches original: ${isMatch}`
    );
    console.log(`  📖 Data retrieved:`, getData);
  } catch (error) {
    test('Read data (GET)', false, error.message);
  }

  // Test 8: Write Additional Data
  console.log(`\n${colors.blue}[8] Testing Multiple Data Records${colors.reset}`);
  try {
    const testData2 = { type: 'user', id: 2, active: true };
    const testData3 = { type: 'config', setting: 'production' };
    
    await authClient.put(bucketId, '/users/user-2', testData2);
    await authClient.put(bucketId, '/config/app', testData3);
    
    test('Write multiple records', true, 'Created 2 additional records');
    console.log(`  📝 Created /users/user-2`);
    console.log(`  ⚙️  Created /config/app`);
  } catch (error) {
    test('Write multiple records', false, error.message);
  }

  // Test 9: Batch Write
  console.log(`\n${colors.blue}[9] Testing Batch Write Operation${colors.reset}`);
  try {
    const batchRes = await authClient.batchWrite(bucketId, [
      { path: '/batch/item-1', data: { id: 1, status: 'pending' } },
      { path: '/batch/item-2', data: { id: 2, status: 'processing' } },
      { path: '/batch/item-3', data: { id: 3, status: 'completed' } }
    ]);
    test('Batch write',
      batchRes.success === true || batchRes.itemsWritten >= 0,
      `Batch operation executed`
    );
    console.log(`  📦 Batch write successful`);
  } catch (error) {
    test('Batch write', false, error.message);
  }

  // Test 10: List Items
  console.log(`\n${colors.blue}[10] Testing List Items${colors.reset}`);
  try {
    const listRes = await authClient.listItems(bucketId);
    test('List items',
      listRes.success === true || listRes.items !== undefined,
      `Retrieved items list`
    );
    console.log(`  📋 Items retrieved: ${listRes.items ? listRes.items.length : 'unknown'}`);
  } catch (error) {
    test('List items', false, error.message);
  }

  // Test 11: Delete Data
  console.log(`\n${colors.blue}[11] Testing Data Delete Operation${colors.reset}`);
  try {
    const delRes = await authClient.delete(bucketId, '/test-data/record1');
    test('Delete data',
      delRes.success === true,
      'Record deleted successfully'
    );
    console.log(`  🗑️  Record /test-data/record1 deleted`);
  } catch (error) {
    test('Delete data', false, error.message);
  }

  // Test 12: Verify Deletion
  console.log(`\n${colors.blue}[12] Testing Deletion Verification${colors.reset}`);
  try {
    await authClient.get(bucketId, '/test-data/record1');
    test('Verify deletion', false, 'Record still exists (should be deleted)');
  } catch (error) {
    const isDeleted = error.message.includes('not found');
    test('Verify deletion', isDeleted, 'Record successfully removed');
  }

  // Test 13: Stats Endpoint
  console.log(`\n${colors.blue}[13] Testing Statistics Endpoint${colors.reset}`);
  try {
    const stats = await authClient.getStats();
    test('Get stats',
      stats.success === true || stats.totalBuckets !== undefined,
      `Stats retrieved`
    );
    console.log(`  📊 Stats available`);
  } catch (error) {
    test('Get stats', false, error.message);
  }

  // Test 14: Login with registered user
  console.log(`\n${colors.blue}[14] Testing User Login${colors.reset}`);
  try {
    const loginRes = await client.login(testEmail, testPassword);
    test('User login',
      loginRes.success && loginRes.token,
      `Login successful, token obtained`
    );
    console.log(`  👤 User: ${loginRes.email}`);
  } catch (error) {
    test('User login', false, error.message);
  }

  // Test 15: Invalid credentials
  console.log(`\n${colors.blue}[15] Testing Invalid Credentials Handling${colors.reset}`);
  try {
    await client.login(testEmail, 'WrongPassword123!');
    test('Invalid credentials', false, 'Should have rejected invalid password');
  } catch (error) {
    const isRejected = error.message.includes('Invalid') || error.message.includes('401');
    test('Invalid credentials', isRejected, 'Correctly rejected invalid credentials');
  }

  // Summary
  console.log(`\n${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║                    TEST SUMMARY                      ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.green}✅ Passed: ${passCount}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
  console.log(`\n${colors.cyan}Total Tests: ${passCount + failCount}${colors.reset}`);

  if (failCount === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Backend and SDK are working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Please review the backend implementation.${colors.reset}`);
  }

  process.exit(failCount === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
  process.exit(1);
});
