# Zenith
Lightning-Fast Distributed Storage
# Getting Started with Zenith Memory

Complete step-by-step guide to set up and start using Zenith Memory in 5 minutes.

## 📋 Prerequisites Check

Before starting, verify you have the required software:

### Check Node.js Installation

```bash
node --version
```

**Should show:** `v16.0.0` or higher

### Check npm Installation

```bash
npm --version
```

**Should show:** `7.0.0` or higher

### Don't have Node.js?

Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

---

## 🚀 Setup Steps

### Step 1: Clone the Repository

Choose your preferred method:

#### Using Git CLI (Recommended)

```bash
git clone https://github.com/PranavKumarprogrammer/Zenith
cd zenith-memory
```

#### Using HTTPS

```bash
git clone https://github.com/PranavKumarprogrammer/Zenith
cd zenith-memory
```

#### Using SSH

```bash
git clone git@github.com:yourusername/zenith-memory.git
cd zenith-memory
```

#### Download as ZIP

1. Go to the [GitHub repository](https://github.com/PranavKumarprogrammer/Zenith)
2. Click **Code** → **Download ZIP**
3. Extract the ZIP file
4. Open terminal in the extracted folder

### Step 2: Install Dependencies

```bash
npm install
```

**What's being installed:**
- `express` - Web server
- `cors` - Cross-origin requests
- `uuid` - ID generation
- `jsonwebtoken` - JWT tokens
- `dotenv` - Environment variables

**Progress indicator:**
```
npm notice created a lockfile as package-lock.json
npm notice added 57 packages, and audited 58 packages
found 0 vulnerabilities
```

**Time taken:** 2-3 minutes

### Step 3: Configure Environment

Create environment file:

```bash
cp .env.example .env
```

Open `.env` in your editor and verify:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=zenith-secret-key-change-in-production
```

**Optional:** Change the values if needed.

### Step 4: Start the Server

```bash
npm start
```

**Expected output:**
```
✅ Zenith Memory Server running on http://localhost:3000

📚 API Documentation:
   POST   /api/auth/register           - Register new user
   POST   /api/auth/login              - Login user
   POST   /api/buckets                 - Create bucket
   GET    /api/buckets                 - List buckets
   PUT    /api/buckets/:bucketId/data/* - Write data
   GET    /api/buckets/:bucketId/data/* - Read data
   DELETE /api/buckets/:bucketId/data/* - Delete data
   GET    /api/buckets/:bucketId/items - List items
   POST   /api/buckets/:bucketId/batch-write - Batch write
   POST   /api/buckets/:bucketId/vector-search - Vector search
   GET    /api/stats                   - Get statistics
   GET    /api/health                  - Health check

🔐 Use Authorization header: Bearer <token>
```

✅ **Server is running!** Leave this terminal open.

### Step 5: Test the Server (New Terminal)

Open a new terminal/command prompt:

#### Test Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:45.123Z",
  "uptime": 5.234,
  "version": "1.0.0"
}
```

✅ **Server is working!**

---

## 💻 First API Call

### Register a User

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token!** You'll need it for other API calls.

---

## 📝 Using the SDK in Node.js

### Create a Test File

Create `my-first-app.js`:

```javascript
const ZMClient = require('./sdk.js');

async function start() {
  try {
    const client = new ZMClient();

    console.log('1️⃣ Registering user...');
    const registered = await client.register(
      'myuser@example.com',
      'mypassword123',
      'My Name'
    );
    console.log('✅ User registered!');
    console.log('Token:', registered.token.substring(0, 20) + '...');

    console.log('\n2️⃣ Creating bucket...');
    const bucket = await client.createBucket('my-first-bucket', {
      durability: 'standard',
      region: 'us-east-1'
    });
    console.log('✅ Bucket created!');
    const bucketId = bucket.bucketId;

    console.log('\n3️⃣ Writing data...');
    await client.put(bucketId, '/hello', {
      message: 'Hello, Zenith Memory!',
      timestamp: new Date()
    });
    console.log('✅ Data written!');

    console.log('\n4️⃣ Reading data...');
    const data = await client.get(bucketId, '/hello');
    console.log('✅ Data retrieved:');
    console.log(data);

    console.log('\n5️⃣ Getting statistics...');
    const stats = await client.getStats();
    console.log('✅ Statistics:');
    console.log(`   Buckets: ${stats.bucketCount}`);
    console.log(`   Items: ${stats.totalItems}`);
    console.log(`   Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

start();
```

### Run Your App

```bash
node my-first-app.js
```

**Expected output:**
```
1️⃣ Registering user...
✅ User registered!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6...

2️⃣ Creating bucket...
✅ Bucket created!

3️⃣ Writing data...
✅ Data written!

4️⃣ Reading data...
✅ Data retrieved:
{
  message: 'Hello, Zenith Memory!',
  timestamp: '2025-01-15T10:30:45.123Z'
}

5️⃣ Getting statistics...
✅ Statistics:
   Buckets: 1
   Items: 1
   Size: 0.12 KB
```

🎉 **You've successfully used Zenith Memory!**

---

## 🏃 Run Built-in Examples

### Example 1: Basic Usage

```bash
npm run example:basic
```

Demonstrates:
- User registration
- Creating buckets
- Reading/writing data
- Statistics

### Example 2: Batch Operations

```bash
npm run example:batch
```

Demonstrates:
- Writing multiple items at once
- Listing items
- Deleting items

### Example 3: Vector Search

```bash
npm run example:search
```

Demonstrates:
- Semantic search
- Finding data by relevance
- Query results

---

## 🧪 Run Tests

Test everything is working correctly:

```bash
npm test
```

**Expected output:**
```
Running full test suite...
✅ Health check passed
✅ Registration test passed
✅ Login test passed
✅ Bucket creation passed
✅ Data write passed
✅ Data read passed
✅ Batch write passed
✅ Vector search passed
✅ All tests passed!
```

---

## 🌐 Using the SDK in Browser

### Create HTML File

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenith Memory Browser Demo</title>
    <style>
        body { font-family: Arial; margin: 40px; }
        .input-group { margin: 10px 0; }
        input { padding: 8px; width: 300px; }
        button { padding: 8px 16px; background: #007bff; color: white; border: none; cursor: pointer; }
        .output { background: #f0f0f0; padding: 15px; margin-top: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Zenith Memory Browser Demo</h1>

    <div class="input-group">
        <label>Email:</label>
        <input type="email" id="email" placeholder="test@example.com">
    </div>

    <div class="input-group">
        <label>Password:</label>
        <input type="password" id="password" placeholder="password123">
    </div>

    <button onclick="register()">Register</button>
    <button onclick="login()">Login</button>

    <div class="output" id="output">Output will appear here...</div>

    <script src="sdk.js"></script>
    <script>
        const client = new ZMClient({ baseURL: 'http://localhost:3000' });

        async function register() {
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                const result = await client.register(email, password, 'Browser User');
                document.getElementById('output').innerHTML = 
                    `<strong>✅ Registration successful!</strong><br>
                    Token: ${result.token.substring(0, 30)}...`;
            } catch (error) {
                document.getElementById('output').innerHTML = `<strong>❌ Error:</strong> ${error.message}`;
            }
        }

        async function login() {
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                const result = await client.login(email, password);
                document.getElementById('output').innerHTML = 
                    `<strong>✅ Login successful!</strong><br>
                    Token: ${result.token.substring(0, 30)}...`;
            } catch (error) {
                document.getElementById('output').innerHTML = `<strong>❌ Error:</strong> ${error.message}`;
            }
        }
    </script>
</body>
</html>
```

### Open in Browser

1. Save as `index.html`
2. Open with your browser
3. Enter email and password
4. Click "Register" or "Login"
5. See the results below

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"

**Solution:** Node.js is not installed. Download from [nodejs.org](https://nodejs.org/)

### Issue: "Port 3000 already in use"

**Solution 1:** Use a different port:
```bash
PORT=3001 npm start
```

**Solution 2:** Kill the process on port 3000:

**On Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**On Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: "Can't connect to server"

Check if server is running:
```bash
curl http://localhost:3000/api/health
```

If it fails:
1. Make sure server terminal is open
2. Check if `npm start` ran without errors
3. Verify port 3000 is not blocked by firewall

### Issue: "CORS error in browser"

The SDK handles CORS, but verify:
1. Server is running on `http://localhost:3000`
2. Browser is on `http://localhost:*` (any port)
3. Not mixing `http://` and `https://`

### Issue: "Invalid token"

Get a new token:
```javascript


## 📚 Next Steps

1. **Read the full README** - `README.md` for complete documentation
2. **Check API Reference** - `docs/API.md` for endpoint details
3. **Explore Examples** - Check `examples/` folder for more use cases
4. **Run Tests** - `npm test` to verify everything works
5. **Deploy** - Follow deployment guide for production setup

---

## 🆘 Need Help?


- 📧 Email: pranavinspiron@gmail.com

---

**Happy coding!** 🚀
