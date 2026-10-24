// components/Navbar.jsx
// Editorial, clean header with brand and connection status.

import React from 'react';

export default function Navbar({ isConnected }) {
  return (
    <header className="navbar">
      <div className="brand">
        <svg
          className="brand-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="brand-title">LinkVault</span>
      </div>

      <div className="nav-status">
        <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
        <span className="status-label">{isConnected ? 'System online' : 'API disconnected'}</span>
      </div>
    </header>
  );
}
