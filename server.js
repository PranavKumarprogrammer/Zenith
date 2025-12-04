const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'zenith-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use real database like MongoDB/PostgreSQL)
const databases = {};
const buckets = {};
const users = {};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// ===== AUTH ENDPOINTS =====

// Register user
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (users[email]) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const userId = uuidv4();
  users[email] = {
    userId,
    email,
    password, // In production, hash this!
    name: name || 'User',
    createdAt: new Date()
  };

  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({
    success: true,
    userId,
    email,
    token
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = users[email];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.userId, email }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    success: true,
    userId: user.userId,
    email,
    token
  });
});

// ===== BUCKET ENDPOINTS =====

// Create bucket
app.post('/api/buckets', authenticateToken, (req, res) => {
  const { name, durability, region } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Bucket name required' });
  }

  const bucketId = uuidv4();
  buckets[bucketId] = {
    bucketId,
    name,
    owner: req.userId,
    durability: durability || 'standard',
    region: region || 'us-east-1',
    createdAt: new Date(),
    itemCount: 0
  };

  databases[bucketId] = {};

  res.status(201).json({
    success: true,
    bucketId,
    name,
    message: 'Bucket created successfully'
  });
});

// List buckets
app.get('/api/buckets', authenticateToken, (req, res) => {
  const userBuckets = Object.values(buckets).filter(b => b.owner === req.userId);

  res.json({
    success: true,
    buckets: userBuckets
  });
});

// ===== DATA ENDPOINTS =====

// PUT - Write data
app.put('/api/buckets/:bucketId/data/*', authenticateToken, (req, res) => {
  const { bucketId } = req.params;
  const path = req.params[0]; // Get remaining path
  const data = req.body;

  if (!buckets[bucketId]) {
    return res.status(404).json({ error: 'Bucket not found' });
  }

  if (buckets[bucketId].owner !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!databases[bucketId]) {
    databases[bucketId] = {};
  }

  databases[bucketId][path] = {
    data,
    createdAt: new Date(),
    updatedAt: new Date(),
    size: JSON.stringify(data).length
  };

  buckets[bucketId].itemCount = Object.keys(databases[bucketId]).length;

  res.json({
    success: true,
    bucketId,
    path,
    message: 'Data stored successfully',
    timestamp: new Date()
  });
});

// GET - Read data
app.get('/api/buckets/:bucketId/data/*', authenticateToken, (req, res) => {
  const { bucketId } = req.params;
  const path = req.params[0];

  if (!buckets[bucketId]) {
    return res.status(404).json({ error: 'Bucket not found' });
  }

  if (buckets[bucketId].owner !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const item = databases[bucketId] && databases[bucketId][path];

  if (!item) {
    return res.status(404).json({ error: 'Data not found' });
  }

  res.json({
    success: true,
    path,
    data: item.data,
    metadata: {
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      size: item.size
    }
  });
});

// DELETE - Delete data
app.delete('/api/buckets/:bucketId/data/*', authenticateToken, (req, res) => {
  const { bucketId } = req.params;
  const path = req.params[0];

  if (!buckets[bucketId]) {
    return res.status(404).json({ error: 'Bucket not found' });
  }

  if (buckets[bucketId].owner !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!databases[bucketId] || !databases[bucketId][path]) {
    return res.status(404).json({ error: 'Data not found' });
  }

  delete databases[bucketId][path];
  buckets[bucketId].itemCount = Object.keys(databases[bucketId]).length;

  res.json({
    success: true,
    message: 'Data deleted successfully'
  });
});

// LIST - List all items in bucket
app.get('/api/buckets/:bucketId/items', authenticateToken, (req, res) => {
  const { bucketId } = req.params;

  if (!buckets[bucketId]) {
    return res.status(404).json({ error: 'Bucket not found' });
  }

  if (buckets[bucketId].owner !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const items = databases[bucketId] ? Object.entries(databases[bucketId]).map(([key, value]) => ({
    path: key,
    size: value.size,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt
  })) : [];

  res.json({
    success: true,
    bucketId,
    itemCount: items.length,
    items
  });
});

// ===== VECTOR SEARCH (Basic implementation) =====

app.post('/api/buckets/:bucketId/vector-search', authenticateToken, (req, res) => {
  const { bucketId } = req.params;
  const { query, topK } = req.body;

  if (!buckets[bucketId]) {
    return res.status(404).json({ error: 'Bucket not found' });
  }

  if (buckets[bucketId].owner !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Simplified vector search - returns top items
  const items = databases[bucketId] ? Object.entries(databases[bucketId]).slice(0, topK || 10).map(([key, value]) => ({
    path: key,
    data: value.data,
    score: Math.random() // In production, use actual vector similarity
  })) : [];

  res.json({
    success: true,
    query,
    results: items
  });
});

// ===== BATCH OPERATIONS =====

app.post('/api/buckets/:bucketId/batch-write', authenticateToken, (req, res) => {
  const { bucketId } = req.params;
  const { items } = req.body;

  if (!buckets[bucketId]) {
    return res.status(404).json({ error: 'Bucket not found' });
  }

  if (buckets[bucketId].owner !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  if (!databases[bucketId]) {
    databases[bucketId] = {};
  }

  const results = items.map(item => {
    const { path, data } = item;
    databases[bucketId][path] = {
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
      size: JSON.stringify(data).length
    };
    return { path, status: 'success' };
  });

  buckets[bucketId].itemCount = Object.keys(databases[bucketId]).length;

  res.json({
    success: true,
    results,
    message: `${items.length} items written successfully`
  });
});

// ===== STATS =====

app.get('/api/stats', authenticateToken, (req, res) => {
  const userBuckets = Object.values(buckets).filter(b => b.owner === req.userId);
  const totalItems = userBuckets.reduce((sum, b) => sum + b.itemCount, 0);

  res.json({
    success: true,
    stats: {
      bucketsCount: userBuckets.length,
      totalItems,
      latency: Math.random() * 5, // Simulated latency
      uptime: '99.99%',
      regions: userBuckets.map(b => b.region)
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Zenith Memory Server running on http://localhost:${PORT}\n`);
  console.log(`📚 API Documentation:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   POST /api/buckets - Create bucket`);
  console.log(`   GET  /api/buckets - List buckets`);
  console.log(`   PUT  /api/buckets/:bucketId/data/* - Write data`);
  console.log(`   GET  /api/buckets/:bucketId/data/* - Read data`);
  console.log(`   DELETE /api/buckets/:bucketId/data/* - Delete data`);
  console.log(`   GET  /api/buckets/:bucketId/items - List items`);
  console.log(`   POST /api/buckets/:bucketId/batch-write - Batch write`);
  console.log(`   POST /api/buckets/:bucketId/vector-search - Vector search`);
  console.log(`   GET  /api/health - Health check\n`);
});
