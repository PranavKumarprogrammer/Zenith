#!/usr/bin/env node

/**
 * Zenith Memory - Quick Start Example
 * 
 * This script demonstrates all core functionality of Zenith Memory:
 * - User registration and authentication
 * - Bucket creation
 * - Data storage and retrieval
 * - Batch operations
 * - Statistics tracking
 * 
 * Run: node quickstart.js
 */

const ZMClient = require('./sdk.js');

// Colored console output for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(color, icon, message) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

function separator() {
  console.log('\n' + '─'.repeat(60) + '\n');
}

async function quickstart() {
  try {
    log(colors.bright + colors.cyan, '🚀', 'Starting Zenith Memory Quick Start...');
    separator();

    // Initialize client
    const client = new ZMClient();

    // ============================================
    // STEP 1: User Registration
    // ============================================
    log(colors.bright + colors.blue, '📝', 'STEP 1: Registering User');
    log(colors.cyan, '→', 'Creating new user account...');

    const user = await client.register(
      'developer@zenith.example.com',
      'SecurePassword123!',
      'Zenith Developer'
    );

    log(colors.green, '✅', `User registered successfully!`);
    log(colors.yellow, '→', `User ID: ${user.userId}`);
    log(colors.yellow, '→', `Authentication Token: ${user.token.substring(0, 20)}...`);

    // Set authentication token for future requests
    client.jwt = user.token;
    log(colors.green, '✅', 'Client authenticated with token');
    separator();

    // ============================================
    // STEP 2: Create Storage Bucket
    // ============================================
    log(colors.bright + colors.blue, '📦', 'STEP 2: Creating Storage Bucket');
    log(colors.cyan, '→', 'Setting up isolated data container...');

    const bucket = await client.createBucket('my-first-app', {
      durability: 'absolute',
      region: 'us-east-1'
    });

    const bucketId = bucket.bucketId;
    log(colors.green, '✅', 'Bucket created successfully!');
    log(colors.yellow, '→', `Bucket ID: ${bucketId}`);
    log(colors.yellow, '→', `Bucket Name: ${bucket.name}`);
    separator();

    // ============================================
    // STEP 3: Store Individual Data
    // ============================================
    log(colors.bright + colors.blue, '💾', 'STEP 3: Storing Data');
    log(colors.cyan, '→', 'Writing user profile...');

    await client.put(bucketId, '/users/john', {
      firstName: 'John',
      lastName: 'Developer',
      email: 'john@example.com',
      role: 'admin',
      joinDate: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    });

    log(colors.green, '✅', 'User profile stored at /users/john');

    log(colors.cyan, '→', 'Writing app configuration...');
    await client.put(bucketId, '/config/app', {
      appName: 'Zenith Demo App',
      version: '1.0.0',
      environment: 'development',
      apiEndpoint: 'http://localhost:3000',
      features: {
        authentication: true,
        storage: true,
        analytics: true,
        vectorSearch: true
      }
    });

    log(colors.green, '✅', 'App configuration stored at /config/app');

    log(colors.cyan, '→', 'Writing feature flags...');
    await client.put(bucketId, '/features/flags', {
      betaFeatures: true,
      darkMode: true,
      vectorSearch: false,
      batchOperations: true
    });

    log(colors.green, '✅', 'Feature flags stored at /features/flags');
    separator();

    // ============================================
    // STEP 4: Retrieve Data
    // ============================================
    log(colors.bright + colors.blue, '📖', 'STEP 4: Retrieving Data');
    log(colors.cyan, '→', 'Fetching user profile...');

    const userProfile = await client.get(bucketId, '/users/john');
    log(colors.green, '✅', 'User profile retrieved successfully!');
    log(colors.yellow, '→', `Name: ${userProfile.data.firstName} ${userProfile.data.lastName}`);
    log(colors.yellow, '→', `Email: ${userProfile.data.email}`);
    log(colors.yellow, '→', `Role: ${userProfile.data.role}`);
    log(colors.yellow, '→', `Theme: ${userProfile.data.preferences.theme}`);

    log(colors.cyan, '→', 'Fetching app configuration...');
    const appConfig = await client.get(bucketId, '/config/app');
    log(colors.green, '✅', 'App configuration retrieved successfully!');
    log(colors.yellow, '→', `App: ${appConfig.data.appName}`);
    log(colors.yellow, '→', `Version: ${appConfig.data.version}`);
    log(colors.yellow, '→', `Environment: ${appConfig.data.environment}`);
    separator();

    // ============================================
    // STEP 5: List All Items
    // ============================================
    log(colors.bright + colors.blue, '📋', 'STEP 5: Listing Bucket Items');
    log(colors.cyan, '→', 'Retrieving all items in bucket...');

    const items = await client.listItems(bucketId);
    log(colors.green, '✅', `Found ${items.items.length} items in bucket`);
    
    items.items.forEach((item, index) => {
      log(colors.yellow, '→', `Item ${index + 1}: ${item.path} (${item.size} bytes)`);
    });
    separator();

    // ============================================
    // STEP 6: Batch Operations
    // ============================================
    log(colors.bright + colors.blue, '⚡', 'STEP 6: Batch Operations (Atomic)');
    log(colors.cyan, '→', 'Writing multiple items atomically...');

    await client.batchWrite(bucketId, [
      {
        path: '/users/alice',
        data: {
          firstName: 'Alice',
          lastName: 'Engineer',
          email: 'alice@example.com',
          role: 'user'
        }
      },
      {
        path: '/users/bob',
        data: {
          firstName: 'Bob',
          lastName: 'Manager',
          email: 'bob@example.com',
          role: 'user'
        }
      },
      {
        path: '/users/charlie',
        data: {
          firstName: 'Charlie',
          lastName: 'Developer',
          email: 'charlie@example.com',
          role: 'user'
        }
      }
    ]);

    log(colors.green, '✅', 'Batch write completed successfully!');
    log(colors.yellow, '→', 'All 3 users stored atomically (all-or-nothing)');
    separator();

    // ============================================
    // STEP 7: Vector Search
    // ============================================
    log(colors.bright + colors.blue, '🔍', 'STEP 7: Vector Search (Semantic)');
    log(colors.cyan, '→', 'Searching for users with admin role...');

    const searchResults = await client.vectorQuery(bucketId, {
      query: 'find admin users',
      topK: 5
    });

    log(colors.green, '✅', `Found ${searchResults.results.length} matching results`);
    searchResults.results.forEach((result, index) => {
      log(colors.yellow, '→', `Result ${index + 1}: ${result.path} (score: ${(result.score * 100).toFixed(2)}%)`);
    });
    separator();

    // ============================================
    // STEP 8: Statistics
    // ============================================
    log(colors.bright + colors.blue, '📊', 'STEP 8: Account Statistics');
    log(colors.cyan, '→', 'Fetching account metrics...');

    const stats = await client.getStats();
    log(colors.green, '✅', 'Statistics retrieved successfully!');
    log(colors.yellow, '→', `Total Buckets: ${stats.bucketsCount}`);
    log(colors.yellow, '→', `Total Items: ${stats.totalItems}`);
    log(colors.yellow, '→', `Average Latency: ${stats.latency}ms`);
    log(colors.yellow, '→', `Uptime: ${stats.uptime}`);
    separator();

    // ============================================
    // STEP 9: Update Data
    // ============================================
    log(colors.bright + colors.blue, '🔄', 'STEP 9: Updating Data');
    log(colors.cyan, '→', 'Updating John\'s profile...');

    await client.put(bucketId, '/users/john', {
      firstName: 'John',
      lastName: 'Developer',
      email: 'john.updated@example.com',
      role: 'admin',
      joinDate: new Date().toISOString(),
      preferences: {
        theme: 'light',
        notifications: false,
        language: 'en'
      },
      lastUpdated: new Date().toISOString()
    });

    log(colors.green, '✅', 'User profile updated successfully!');

    const updatedProfile = await client.get(bucketId, '/users/john');
    log(colors.yellow, '→', `Email: ${updatedProfile.data.email}`);
    log(colors.yellow, '→', `Theme: ${updatedProfile.data.preferences.theme}`);
    separation();

    // ============================================
    // STEP 10: Delete Data
    // ============================================
    log(colors.bright + colors.blue, '🗑️', 'STEP 10: Deleting Data');
    log(colors.cyan, '→', 'Deleting feature flags...');

    await client.delete(bucketId, '/features/flags');
    log(colors.green, '✅', 'Feature flags deleted successfully!');

    log(colors.cyan, '→', 'Verifying deletion...');
    const remainingItems = await client.listItems(bucketId);
    log(colors.green, '✅', `Now ${remainingItems.items.length} items remain in bucket`);
    separator();

    // ============================================
    // STEP 11: Health Check
    // ============================================
    log(colors.bright + colors.blue, '❤️', 'STEP 11: Server Health Check');
    log(colors.cyan, '→', 'Checking server status...');

    const health = await client.health();
    log(colors.green, '✅', `Server Status: ${health.status}`);
    log(colors.yellow, '→', `Server is running and healthy!`);
    separator();

    // ============================================
    // COMPLETION
    // ============================================
    log(colors.bright + colors.green, '🎉', 'Quick Start Completed Successfully!');
    console.log('\n' + '═'.repeat(60));
    console.log('');
    log(colors.bright + colors.green, '✨', 'Summary of what you learned:');
    console.log('');
    log(colors.yellow, '✓', 'User registration and authentication');
    log(colors.yellow, '✓', 'Creating isolated storage buckets');
    log(colors.yellow, '✓', 'Writing and reading JSON data');
    log(colors.yellow, '✓', 'Listing bucket contents');
    log(colors.yellow, '✓', 'Batch operations (atomic writes)');
    log(colors.yellow, '✓', 'Semantic search (vector queries)');
    log(colors.yellow, '✓', 'Account statistics and monitoring');
    log(colors.yellow, '✓', 'Updating existing data');
    log(colors.yellow, '✓', 'Deleting data securely');
    log(colors.yellow, '✓', 'Server health monitoring');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    log(colors.bright + colors.blue, '🚀', 'You\'re ready to build with Zenith Memory!');
    console.log('');
    log(colors.cyan, '📚', 'Next steps:');
    log(colors.yellow, '1️⃣', 'Read GETTING_STARTED.md for comprehensive guide');
    log(colors.yellow, '2️⃣', 'Check README.md for full API documentation');
    log(colors.yellow, '3️⃣', 'Visit http://localhost:3000 for web interface');
    log(colors.yellow, '4️⃣', 'Build your own app with the SDK!');
    console.log('');
    log(colors.bright + colors.green, '📝', 'Built by Pranav - Enterprise Storage for Developers');
    console.log('');

  } catch (error) {
    log(colors.red, '❌', `Error: ${error.message}`);
    console.error('\nFull Error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the quickstart
quickstart();
