// models/Url.js
// This file defines the Mongoose Schema and Model for our shortened URLs.
// A schema is like a blueprint that dictates what fields each document in MongoDB should have.

const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  // originalUrl: The long URL provided by the user (e.g., https://example.com/very/long/path)
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
  },

  // shortCode: The unique alphanumeric string used in the redirect URL (e.g., 'aB39xZ')
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // Creates an index for fast lookups during redirects
  },

  // clicks: The total number of times someone has accessed this short link
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },

  // expiresAt: Optional expiration timestamp. If set and the date is past, redirect is blocked.
  expiresAt: {
    type: Date,
    default: null,
  },

  // createdAt: Timestamp recording when the link was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compile the schema into a Mongoose model named 'Url'
// MongoDB will automatically create a collection named 'urls' (plural lowercase)
module.exports = mongoose.model('Url', urlSchema);
