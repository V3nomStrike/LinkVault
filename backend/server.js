// server.js
// Main entry point for the LinkVault Express backend application.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Url = require('./models/Url');
const urlRoutes = require('./routes/urls');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware: Enable Cross-Origin Resource Sharing (CORS) so React frontend can call this API
app.use(cors());

// Middleware: Parse incoming JSON request payloads
app.use(express.json());

// Connect to MongoDB
connectDB();

// -------------------------------------------------------------
// Health Check Route
// Useful for deployment platforms (like Render/Railway) to verify the server is alive
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    service: 'LinkVault Backend API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// API Routes
// All URL management routes (create, list, delete) are mounted at /api/urls
// -------------------------------------------------------------
app.use('/api/urls', urlRoutes);

// -------------------------------------------------------------
// Redirection Route: GET /:shortCode
// When a user visits http://localhost:5000/aB39xZ:
// 1. Look up the document by shortCode.
// 2. Check if the link has expired.
// 3. Increment the click count atomically using $inc.
// 4. Send an HTTP 302 redirect to the original long URL.
// -------------------------------------------------------------
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Configured frontend client URL with fallback to local development port
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

    // Ignore requests for browser favicon
    if (shortCode === 'favicon.ico') {
      return res.status(204).end();
    }

    // Find the URL document
    const urlDoc = await Url.findOne({ shortCode });

    if (!urlDoc) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Link Not Found - LinkVault</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 8px; border: 1px solid #334155; max-width: 420px; text-align: center; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #f87171; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
            a { display: inline-block; margin-top: 1.25rem; color: #38bdf8; text-decoration: none; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>404 - Link Not Found</h1>
            <p>The shortened link with code <strong>${shortCode}</strong> does not exist or may have been deleted.</p>
            <a href="${clientUrl}">← Return to LinkVault</a>
          </div>
        </body>
        </html>
      `);
    }

    // Check if the link has expired
    if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) <= new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Link Expired - LinkVault</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 8px; border: 1px solid #334155; max-width: 420px; text-align: center; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #fbbf24; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
            a { display: inline-block; margin-top: 1.25rem; color: #38bdf8; text-decoration: none; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link Expired</h1>
            <p>This shortened link expired on <strong>${new Date(urlDoc.expiresAt).toLocaleString()}</strong> and can no longer be accessed.</p>
            <a href="${clientUrl}">← Return to LinkVault</a>
          </div>
        </body>
        </html>
      `);
    }

    // Increment click count atomically using MongoDB $inc
    // This avoids race conditions where two simultaneous clicks might overwrite each other
    await Url.findByIdAndUpdate(urlDoc._id, { $inc: { clicks: 1 } });

    // Perform HTTP 302 Found (temporary redirect) to the original URL
    return res.redirect(urlDoc.originalUrl);
  } catch (error) {
    console.error('Redirection error:', error);
    return res.status(500).send('Internal server error during redirection.');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[LinkVault Server] Running on http://localhost:${PORT}`);
});
