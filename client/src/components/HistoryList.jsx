import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function HistoryList({ onSelect, refreshKey }) {
  const { api } = useAuth();
  const [analyses, setAnalyses] = useState(null); // null = loading
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/menu/history');
        if (!cancelled) setAnalyses(data.analyses);
      } catch {
        /* signed out or transient — leave list as-is */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function open(id) {
    setError('');
    try {
      const data = await api(`/api/menu/history/${id}`);
      onSelect(data.analysis);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!analyses) return null;

  return (
    <div id="history-list" className="history-list">
      {error && <p className="form-error">{error}</p>}
      {analyses.length === 0 ? (
        <p className="muted small">No scans yet.</p>
      ) : (
        analyses.map((a) => (
          <button className="history-item" key={a.id} onClick={() => open(a.id)}>
            <span className="hi-name">{a.restaurantName}</span>
            <span className="hi-meta">{a.dishCount} dishes · {new Date(a.createdAt).toLocaleDateString()}</span>
          </button>
        ))
      )}
    </div>
  );
}
