// components/UrlForm.jsx
// Compact, inline URL shortener input with expiry option and clean success banner.

import React, { useState } from 'react';

export default function UrlForm({ onUrlCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latestCreated, setLatestCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!originalUrl.trim()) {
      setError('Enter a destination URL.');
      return;
    }

    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    // Optional frontend alias validation check
    const trimmedAlias = customAlias.trim();
    if (trimmedAlias) {
      if (trimmedAlias.length < 3 || trimmedAlias.length > 30) {
        setError('Custom alias must be between 3 and 30 characters.');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedAlias)) {
        setError('Custom alias can only contain letters, numbers, hyphens, and underscores.');
        return;
      }
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const payload = { originalUrl: originalUrl.trim() };

      if (trimmedAlias) {
        payload.customAlias = trimmedAlias;
      }

      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      }

      const response = await fetch(`${apiBase}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
      setLatestCreated(data.url);
      setCopied(false);
      onUrlCreated(data.url);
    } catch (err) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!latestCreated?.shortUrl) return;
    navigator.clipboard.writeText(latestCreated.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="shortener-box">
      <form onSubmit={handleSubmit} className="shortener-form">
        <div className="input-row">
          <input
            id="url-input"
            type="text"
            className="input-main"
            placeholder="Paste a long destination URL (e.g. https://...)"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            disabled={loading}
            required
            autoComplete="off"
            spellCheck="false"
          />

          <input
            id="alias-input"
            type="text"
            className="input-alias"
            placeholder="Custom alias (optional)"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
          />

          <button
            type="button"
            className={`btn-subtle-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="Toggle expiration date"
          >
            {expiresAt ? 'Expires set' : 'Add expiry'}
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Shorten'}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-row">
            <label htmlFor="expiry-input" className="advanced-label">
              Link expiration:
            </label>
            <input
              id="expiry-input"
              type="datetime-local"
              className="input-expiry"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={loading}
            />
            {expiresAt && (
              <button
                type="button"
                className="btn-clear"
                onClick={() => setExpiresAt('')}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </form>

      {error && <div className="notice-error">{error}</div>}

      {latestCreated && (
        <div className="created-banner">
          <div className="created-text">
            <span className="created-label">Created</span>
            <a
              href={latestCreated.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="created-link"
            >
              {latestCreated.shortUrl}
            </a>
            <span className="created-arrow">→</span>
            <span className="created-dest" title={latestCreated.originalUrl}>
              {latestCreated.originalUrl}
            </span>
          </div>
          <button type="button" onClick={handleCopy} className="btn-secondary">
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}
