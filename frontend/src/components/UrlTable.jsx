// components/UrlTable.jsx
// Clean, readable list of shortened links with subtle row separators and clear actions.

import React, { useState } from 'react';

export default function UrlTable({ urls, loading, onDeleteUrl }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  };

  return (
    <section className="list-section">
      <div className="list-header">
        <h2 className="list-title">Links</h2>
        <span className="list-meta">
          {urls.length} {urls.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {loading ? (
        <div className="state-box">
          <p className="state-desc">Loading records...</p>
        </div>
      ) : urls.length === 0 ? (
        <div className="state-box">
          <p className="state-heading">No links created yet</p>
          <p className="state-desc">
            Shorten a destination URL above. Created links and click counts will appear here.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="links-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Short link</th>
                <th>Destination</th>
                <th style={{ width: '70px', textAlign: 'right' }}>Clicks</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '110px' }}>Created</th>
                <th style={{ width: '110px' }}>Expires</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((item) => {
                const expired = isExpired(item.expiresAt);
                return (
                  <tr key={item._id} className={expired ? 'row-expired' : ''}>
                    <td>
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="short-link"
                      >
                        /{item.shortCode}
                      </a>
                    </td>

                    <td>
                      <div className="dest-url" title={item.originalUrl}>
                        {item.originalUrl}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span className="clicks-val">{item.clicks || 0}</span>
                    </td>

                    <td>
                      <span className={`tag-status ${expired ? 'expired' : 'active'}`}>
                        {expired ? 'Expired' : 'Active'}
                      </span>
                    </td>

                    <td className="cell-date">{formatDate(item.createdAt)}</td>

                    <td className="cell-date">{formatDate(item.expiresAt)}</td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="cell-actions">
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => handleCopy(item._id, item.shortUrl)}
                          title="Copy short link"
                        >
                          {copiedId === item._id ? 'Copied' : 'Copy'}
                        </button>

                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action"
                          title="Open short link"
                        >
                          Open ↗
                        </a>

                        <button
                          type="button"
                          className="btn-action btn-danger"
                          onClick={() => onDeleteUrl(item._id)}
                          title="Delete link"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
