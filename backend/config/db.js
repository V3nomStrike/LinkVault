// config/db.js
// This file handles connecting our Express server to the MongoDB database using Mongoose.
const dns = require('node:dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('[DNS Config Notice]: Defaulting to system DNS servers.');
}
const mongoose = require('mongoose');

// Connection event handlers for real-time monitoring
mongoose.connection.on('connected', () => {
  console.log('[MongoDB Event]: Connection established successfully.');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Event]: Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Event Error]:', {
    name: err.name,
    message: err.message,
    code: err.code || 'UNKNOWN',
  });
});

let isConnecting = false;
let retryTimer = null;

/**
 * Connect to MongoDB using the URI provided in environment variables.
 * Safe diagnostics log error details without exposing credentials.
 * Automatically retries with exponential backoff if the initial connection fails.
 */
const connectDB = async (retryCount = 0) => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[MongoDB Config Error]: MONGODB_URI is not defined in environment variables.');
    return;
  }

  // Diagnostic helper to safely check URI format without leaking credentials
  const isSrv = uri.startsWith('mongodb+srv://');
  const isStandard = uri.startsWith('mongodb://');
  if (!isSrv && !isStandard) {
    console.error('[MongoDB Config Error]: MONGODB_URI does not start with "mongodb://" or "mongodb+srv://". Check Render environment variable.');
  }

  isConnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    isConnecting = false;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, DB -> ${conn.connection.name}`);
  } catch (error) {
    isConnecting = false;
    console.error('[MongoDB Connection Error]:', {
      name: error.name,
      message: error.message,
      code: error.code || error.codeName || 'NONE',
    });

    // Retry connection automatically with backoff (capped at 15s)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 15000);
    console.log(`[MongoDB Retry]: Scheduling reconnection attempt #${retryCount + 1} in ${delay / 1000}s...`);
    retryTimer = setTimeout(() => {
      connectDB(retryCount + 1);
    }, delay);
  }
};

module.exports = connectDB;

