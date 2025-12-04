// Zenith Memory SDK
// Real, working npm package for Zenith Memory API

const http = require('http');
const https = require('https');
const url = require('url');

class ZMClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ZENITH_API_KEY;
    this.jwt = options.jwt;
    this.baseURL = options.baseURL || 'http://localhost:3000/api';
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.jwt || this.apiKey) {
      headers['Authorization'] = `Bearer ${this.jwt || this.apiKey}`;
    }

    return headers;
  }

  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      try {
        const fullUrl = `${this.baseURL}${endpoint}`;
        const parsedUrl = url.parse(fullUrl);
        
        const requestOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.path,
          method: method,
          headers: this.getHeaders()
        };

        const client = parsedUrl.protocol === 'https:' ? https : http;

        const req = client.request(requestOptions, (res) => {
          let body = '';

          res.on('data', (chunk) => {
            body += chunk;
          });

          res.on('end', () => {
            try {
              if (!body) {
                resolve({});
                return;
              }

              const response = JSON.parse(body);

              if (res.statusCode >= 400) {
                reject(new Error(response.error || `HTTP ${res.statusCode}`));
              } else {
                resolve(response);
              }
            } catch (e) {
              reject(new Error(`Failed to parse response: ${e.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Request failed: ${error.message}`));
        });

        if (data) {
          req.write(JSON.stringify(data));
        }

        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Authentication
  async register(email, password, name) {
    const response = await this.request('POST', '/auth/register', {
      email,
      password,
      name
    });
    if (response.token) {
      this.jwt = response.token;
    }
    return response;
  }

  async login(email, password) {
    const response = await this.request('POST', '/auth/login', {
      email,
      password
    });
    if (response.token) {
      this.jwt = response.token;
    }
    return response;
  }

  // Bucket operations
  async createBucket(name, options = {}) {
    return this.request('POST', '/buckets', {
      name,
      durability: options.durability || 'standard',
      region: options.region || 'us-east-1'
    });
  }

  async listBuckets() {
    return this.request('GET', '/buckets');
  }

  // Data operations
  async put(bucketId, path, data) {
    return this.request('PUT', `/buckets/${bucketId}/data${path}`, data);
  }

  async get(bucketId, path) {
    const response = await this.request('GET', `/buckets/${bucketId}/data${path}`);
    return response.data;
  }

  async delete(bucketId, path) {
    return this.request('DELETE', `/buckets/${bucketId}/data${path}`);
  }

  async listItems(bucketId) {
    return this.request('GET', `/buckets/${bucketId}/items`);
  }

  // Batch operations
  async batchWrite(bucketId, items) {
    return this.request('POST', `/buckets/${bucketId}/batch-write`, {
      items
    });
  }

  // Vector search
  async vectorQuery(bucketId, options = {}) {
    return this.request('POST', `/buckets/${bucketId}/vector-search`, {
      query: options.query,
      topK: options.topK || 10
    });
  }

  // Stats
  async getStats() {
    return this.request('GET', '/stats');
  }

  async health() {
    return this.request('GET', '/health');
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZMClient;
}

// Export for browsers
if (typeof window !== 'undefined') {
  window.ZMClient = ZMClient;
}
