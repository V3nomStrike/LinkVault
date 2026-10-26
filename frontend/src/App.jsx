// App.jsx
// Main application layout with left-aligned heading, concise description, and real data flow.

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import UrlForm from './components/UrlForm';
import UrlTable from './components/UrlTable';
import './App.css';

export default function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/urls`);
      if (!res.ok) {
        throw new Error('Could not load URLs.');
      }
      const data = await res.json();
      setUrls(data.urls || []);
      setIsConnected(true);
      setFetchError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setIsConnected(false);
      setFetchError('Unable to connect to the backend server. Verify that it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await fetch(`${apiBase}/api/health`);
      if (res.ok) {
        const data = await res.json();
        // Server responded successfully; if database status is tracked, ensure it's responsive
        setIsConnected(data.status === 'ok');
      } else {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchUrls();

    // Check backend health periodically every 15 seconds to keep connection status fresh
    const interval = setInterval(() => {
      checkHealth();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleUrlCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleDeleteUrl = async (id) => {
    if (!window.confirm('Delete this shortened link?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/urls/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete URL');
      }

      setUrls((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting URL');
    }
  };

  return (
    <div className="layout">
      <Navbar isConnected={isConnected} />

      <main className="content">
        <header className="page-header">
          <h1 className="page-title">LinkVault</h1>
          <p className="page-desc">
            Shorten URLs, set optional expiration dates, and monitor redirect click counts.
          </p>
        </header>

        {fetchError && <div className="notice-error">{fetchError}</div>}

        <UrlForm onUrlCreated={handleUrlCreated} />

        <StatsCards urls={urls} />

        <UrlTable urls={urls} loading={loading} onDeleteUrl={handleDeleteUrl} />
      </main>

      <footer className="page-footer">
        <span>LinkVault • MERN URL Shortener</span>
        <span>Minimal, self-contained architecture</span>
      </footer>
    </div>
  );
}
