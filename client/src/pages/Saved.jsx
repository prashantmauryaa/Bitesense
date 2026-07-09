import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function scoreClass(score, verdict) {
  if (verdict === 'Avoid') return 'avoid';
  if (score >= 80) return 'great';
  if (score >= 65) return 'good';
  if (score >= 45) return 'ok';
  return 'caution';
}

export default function Saved() {
  const { api } = useAuth();
  const [meals, setMeals] = useState(null); // null = loading
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api('/api/meals');
      setMeals(data.meals);
    } catch {
      /* signed out or transient */
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id) {
    setError('');
    try {
      await api(`/api/meals/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="tab-head">
        <h2>Saved meals</h2>
        <p className="muted">Dishes you've bookmarked, with their scores at the time you saved them.</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div id="saved-list">
        {meals && meals.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">♡</p>
            <h2>Nothing saved yet</h2>
            <p className="muted">When a dish looks right, hit "Save this meal" in the results — it lands here.</p>
          </div>
        )}
        {meals && meals.length > 0 && meals.map((m) => {
          const cls = scoreClass(m.dish.score, m.dish.verdict);
          return (
            <div className="saved-item" key={m.id}>
              <div className="si-body">
                <div className="si-name">{m.dish.name}</div>
                <div className="si-meta">{m.restaurantName || 'Unknown restaurant'} · {m.dish.nutrition.calories} kcal · saved {new Date(m.savedAt).toLocaleDateString()}</div>
              </div>
              <span className={`saved-score s-${cls}`}>{m.dish.score}</span>
              <button className="btn btn-ghost btn-sm btn-del-meal" onClick={() => remove(m.id)}>Remove</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
