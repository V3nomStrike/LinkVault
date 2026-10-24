// components/StatsCards.jsx
// Compact, inline summary metrics rather than oversized cards.

import React from 'react';

export default function StatsCards({ urls }) {
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const activeLinks = urls.filter((url) => {
    if (!url.expiresAt) return true;
    return new Date(url.expiresAt) > new Date();
  }).length;

  return (
    <div className="metrics-strip">
      <div className="metric-item">
        <span className="metric-label">Total links</span>
        <span className="metric-val">{totalLinks}</span>
      </div>
      <div className="metric-divider" />
      <div className="metric-item">
        <span className="metric-label">Total clicks</span>
        <span className="metric-val">{totalClicks}</span>
      </div>
      <div className="metric-divider" />
      <div className="metric-item">
        <span className="metric-label">Active</span>
        <span className="metric-val">{activeLinks}</span>
      </div>
    </div>
  );
}
