#!/usr/bin/env node

/**
 * Zenith Memory - Real-World Example Application
 * 
 * This example demonstrates a complete user management system using Zenith Memory:
 * - User registration and authentication
 * - User profile management
 * - Session tracking
 * - Activity logging
 * - User search
 * 
 * Run: node example-app.js
 */

const ZMClient = require('./sdk.js');

class UserManagementApp {
  constructor() {
    this.client = new ZMClient();
    this.bucketId = null;
    this.currentUser = null;
  }

  async initialize() {
    console.log('🚀 Initializing User Management App...\n');

    // Register or login
    const email = 'app-user@example.com';
    const password = 'AppPassword123!';
    const name = 'App User';

    try {
      console.log('📝 Registering user...');
      const user = await this.client.register(email, password, name);
      this.currentUser = user;
      console.log(`✅ User registered: ${user.userId}\n`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('👤 User already exists, logging in...');
        const user = await this.client.login(email, password);
        this.currentUser = user;
        console.log(`✅ User logged in: ${user.userId}\n`);
      } else {
        throw error;
      }
    }

    // Set authentication
    this.client.jwt = this.currentUser.token;

    // Create or get bucket
    console.log('📦 Setting up storage bucket...');
    try {
      const buckets = await this.client.listBuckets();
      if (buckets.buckets.length > 0) {
        this.bucketId = buckets.buckets[0].bucketId;
        console.log(`✅ Using existing bucket: ${this.bucketId}\n`);
      } else {
        const bucket = await this.client.createBucket('user-management-app');
        this.bucketId = bucket.bucketId;
        console.log(`✅ Created new bucket: ${this.bucketId}\n`);
      }
    } catch (error) {
      const bucket = await this.client.createBucket('user-management-app');
      this.bucketId = bucket.bucketId;
      console.log(`✅ Created new bucket: ${this.bucketId}\n`);
    }
  }

  async createUser(userData) {
    const userId = userData.email.split('@')[0];
    const userPath = `/users/${userId}`;

    const user = {
      id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    await this.client.put(this.bucketId, userPath, user);
    console.log(`✅ User created: ${userId}`);
    return user;
  }

  async getUser(userId) {
    const userPath = `/users/${userId}`;
    const result = await this.client.get(this.bucketId, userPath);
    return result.data;
  }

  async updateUser(userId, updates) {
    const userPath = `/users/${userId}`;
    const user = await this.getUser(userId);

    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.client.put(this.bucketId, userPath, updated);
    console.log(`✅ User updated: ${userId}`);
    return updated;
  }

  async deleteUser(userId) {
    const userPath = `/users/${userId}`;
    await this.client.delete(this.bucketId, userPath);
    console.log(`✅ User deleted: ${userId}`);
  }

  async createSession(userId, sessionData) {
    const sessionId = `session-${Date.now()}`;
    const sessionPath = `/sessions/${userId}/${sessionId}`;

    const session = {
      id: sessionId,
      userId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString()
    };

    await this.client.put(this.bucketId, sessionPath, session);
    console.log(`✅ Session created for ${userId}`);
    return session;
  }

  async logActivity(userId, activity) {
    const timestamp = Date.now();
    const activityPath = `/activity/${userId}/${timestamp}`;

    const log = {
      timestamp,
      userId,
      ...activity
    };

    await this.client.put(this.bucketId, activityPath, log);
  }

  async getUserStats() {
    const items = await this.client.listItems(this.bucketId);
    const stats = await this.client.getStats();

    return {
      totalItems: items.items.length,
      bucketsCount: stats.bucketsCount,
      latency: stats.latency,
      uptime: stats.uptime
    };
  }

  async searchUsers(query) {
    const results = await this.client.vectorQuery(this.bucketId, {
      query: query,
      topK: 10
    });

    return results.results;
  }

  async run() {
    try {
      // Initialize
      await this.initialize();

      console.log('═'.repeat(60));
      console.log('📱 CREATING SAMPLE USERS');
      console.log('═'.repeat(60) + '\n');

      // Create sample users
      const users = [
        {
          firstName: 'Alice',
          lastName: 'Engineer',
          email: 'alice@example.com',
          role: 'engineer',
          department: 'Engineering'
        },
        {
          firstName: 'Bob',
          lastName: 'Manager',
          email: 'bob@example.com',
          role: 'manager',
          department: 'Management'
        },
        {
          firstName: 'Charlie',
          lastName: 'Designer',
          email: 'charlie@example.com',
          role: 'designer',
          department: 'Design'
        },
        {
          firstName: 'Diana',
          lastName: 'Developer',
          email: 'diana@example.com',
          role: 'engineer',
          department: 'Engineering'
        }
      ];

      for (const user of users) {
        await this.createUser(user);
      }

      console.log('\n' + '═'.repeat(60));
      console.log('👤 RETRIEVING USER DATA');
      console.log('═'.repeat(60) + '\n');

      const alice = await this.getUser('alice');
      console.log(`📖 Retrieved user: ${alice.firstName} ${alice.lastName}`);
      console.log(`   Email: ${alice.email}`);
      console.log(`   Role: ${alice.role}`);
      console.log(`   Department: ${alice.department}`);
      console.log(`   Created: ${alice.createdAt}`);

      console.log('\n' + '═'.repeat(60));
      console.log('✏️  UPDATING USER DATA');
      console.log('═'.repeat(60) + '\n');

      const updated = await this.updateUser('alice', {
        role: 'senior-engineer',
        department: 'Engineering',
        verified: true
      });

      console.log(`📝 Updated Alice's role to: ${updated.role}`);
      console.log(`   Verified: ${updated.verified}`);

      console.log('\n' + '═'.repeat(60));
      console.log('🔐 CREATING SESSION');
      console.log('═'.repeat(60) + '\n');

      const session = await this.createSession('alice', {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        type: 'web'
      });

      console.log(`🔑 Session ID: ${session.id}`);
      console.log(`   Expires: ${session.expiresAt}`);

      console.log('\n' + '═'.repeat(60));
      console.log('📊 LOGGING ACTIVITIES');
      console.log('═'.repeat(60) + '\n');

      await this.logActivity('alice', {
        type: 'login',
        ip: '192.168.1.100'
      });

      await this.logActivity('alice', {
        type: 'view_page',
        page: '/dashboard'
      });

      await this.logActivity('alice', {
        type: 'update_profile',
        fields: ['role', 'department']
      });

      console.log('✅ Logged 3 activities for Alice');

      console.log('\n' + '═'.repeat(60));
      console.log('🔍 SEARCHING USERS');
      console.log('═'.repeat(60) + '\n');

      const engineerResults = await this.searchUsers('find engineers');
      console.log(`🔎 Search for "engineers": Found ${engineerResults.length} results`);
      engineerResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.path} (score: ${(result.score * 100).toFixed(1)}%)`);
      });

      const seniorResults = await this.searchUsers('senior level staff');
      console.log(`\n🔎 Search for "senior level staff": Found ${seniorResults.length} results`);

      console.log('\n' + '═'.repeat(60));
      console.log('📈 STATISTICS');
      console.log('═'.repeat(60) + '\n');

      const stats = await this.getUserStats();
      console.log(`📊 Total Items: ${stats.totalItems}`);
      console.log(`📊 Buckets: ${stats.bucketsCount}`);
      console.log(`📊 Latency: ${stats.latency}ms`);
      console.log(`📊 Uptime: ${stats.uptime}`);

      console.log('\n' + '═'.repeat(60));
      console.log('🗑️  DELETING USER');
      console.log('═'.repeat(60) + '\n');

      await this.deleteUser('charlie');
      console.log('User charlie has been deleted');

      console.log('\n' + '═'.repeat(60));
      console.log('✅ EXAMPLE COMPLETED');
      console.log('═'.repeat(60) + '\n');

      console.log('🎉 This example demonstrated:');
      console.log('   • User creation and management');
      console.log('   • Data retrieval and updates');
      console.log('   • Session tracking');
      console.log('   • Activity logging');
      console.log('   • User search/queries');
      console.log('   • Statistics tracking');
      console.log('   • Data deletion');
      console.log('\n💡 You can build many applications on top of Zenith Memory!');

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error);
      process.exit(1);
    }
  }
}

// Run the example app
const app = new UserManagementApp();
app.run();
