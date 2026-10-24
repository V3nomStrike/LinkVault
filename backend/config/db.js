// config/db.js
// This file handles connecting our Express server to the MongoDB database using Mongoose.
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI provided in environment variables.
 * We wrap this in a function so server.js can call it when the application boots up.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // We log the error clearly so the developer knows why it failed (e.g. wrong password, network blocked)
    // In production/dev, failing database connection is critical, but we let the server report health
  }
};

module.exports = connectDB;
