// routes/urls.js
// This file handles the REST API endpoints for creating, retrieving, and deleting shortened URLs.

const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');

// Define character set for nanoid (alphanumeric, 6 characters long -> ~68 billion combinations)
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

/**
 * Helper function to validate if a string is a valid HTTP/HTTPS URL.
 * Beginner tip: We use the built-in Node.js `URL` object. If constructor throws or protocol isn't http/https, it's invalid.
 */
function isValidUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

/**
 * @route   POST /api/urls
 * @desc    Create a new shortened URL
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { originalUrl, expiresAt, customAlias } = req.body;

    // 1. Validation: check if URL was provided
    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid URL string.' });
    }

    const trimmedUrl = originalUrl.trim();

    // 2. Validation: ensure it is a valid HTTP or HTTPS URL
    if (!isValidUrl(trimmedUrl)) {
      return res.status(400).json({
        error: 'Invalid URL. Only full URLs starting with http:// or https:// are allowed.'
      });
    }

    // 3. Optional Expiry validation
    let validExpiresAt = null;
    if (expiresAt) {
      const parsedDate = new Date(expiresAt);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiry date format.' });
      }
      if (parsedDate <= new Date()) {
        return res.status(400).json({ error: 'Expiry date must be in the future.' });
      }
      validExpiresAt = parsedDate;
    }

    // 4. Handle Short Code (Custom alias vs Random generation)
    let shortCode;
    const trimmedAlias = typeof customAlias === 'string' ? customAlias.trim() : '';

    if (trimmedAlias) {
      // Validate alias length (3 - 30 characters)
      if (trimmedAlias.length < 3 || trimmedAlias.length > 30) {
        return res.status(400).json({
          error: 'Custom alias must be between 3 and 30 characters.'
        });
      }

      // Validate alias characters (letters, numbers, hyphens, and underscores only)
      const aliasRegex = /^[a-zA-Z0-9_-]+$/;
      if (!aliasRegex.test(trimmedAlias)) {
        return res.status(400).json({
          error: 'Custom alias can only contain letters, numbers, hyphens (-), and underscores (_).'
        });
      }

      // Check for collision with existing short codes or reserved paths
      const reserved = ['api', 'favicon.ico'];
      if (reserved.includes(trimmedAlias.toLowerCase())) {
        return res.status(400).json({
          error: 'This alias is reserved by the system. Please choose another.'
        });
      }

      const existingAlias = await Url.findOne({ shortCode: trimmedAlias });
      if (existingAlias) {
        return res.status(409).json({
          error: 'This custom alias is already taken. Please choose another.'
        });
      }

      shortCode = trimmedAlias;
    } else {
      // Generate a unique random short code with collision handling
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 5) {
        shortCode = nanoid();
        const existing = await Url.findOne({ shortCode });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: 'Could not generate a unique code. Please try again.' });
      }
    }

    // 5. Save the new URL document to MongoDB
    const newUrl = new Url({
      originalUrl: trimmedUrl,
      shortCode,
      expiresAt: validExpiresAt,
    });

    await newUrl.save();

    // 6. Return response with the full short URL included for convenience
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fullShortUrl = `${baseUrl}/${newUrl.shortCode}`;

    return res.status(201).json({
      message: 'Short URL created successfully.',
      url: {
        _id: newUrl._id,
        originalUrl: newUrl.originalUrl,
        shortCode: newUrl.shortCode,
        shortUrl: fullShortUrl,
        clicks: newUrl.clicks,
        expiresAt: newUrl.expiresAt,
        createdAt: newUrl.createdAt,
      }
    });
  } catch (error) {
    // Safely handle MongoDB duplicate-key errors (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'This custom alias is already in use. Please choose another.'
      });
    }

    console.error('Error creating short URL:', error);
    return res.status(500).json({ error: 'Server error while creating short URL.' });
  }
});

/**
 * @route   GET /api/urls
 * @desc    Get all shortened URLs (sorted newest first)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    // Add the computed full shortUrl to each object for easy display in frontend
    const urlsWithFullUrl = urls.map(item => ({
      _id: item._id,
      originalUrl: item.originalUrl,
      shortCode: item.shortCode,
      shortUrl: `${baseUrl}/${item.shortCode}`,
      clicks: item.clicks,
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
    }));

    return res.status(200).json({ urls: urlsWithFullUrl });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return res.status(500).json({ error: 'Server error while retrieving URLs.' });
  }
});

/**
 * @route   DELETE /api/urls/:id
 * @desc    Delete a shortened URL by its MongoDB _id
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUrl = await Url.findByIdAndDelete(id);

    if (!deletedUrl) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    return res.status(200).json({ message: 'URL deleted successfully.' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return res.status(500).json({ error: 'Server error while deleting URL.' });
  }
});

module.exports = router;
