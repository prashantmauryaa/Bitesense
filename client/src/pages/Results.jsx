import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import DishRow from '../components/DishRow.jsx';

export default function Results({ analysis, onGoToScan }) {
  const { user } = useAuth();

  if (!analysis) {
    return (
      <div className="empty-state">
        <p className="empty-icon">☰</p>
        <h2>No menu analyzed yet</h2>
        <p className="muted">Scan a menu and your ranked dishes will appear here, best match first.</p>
        <button className="btn btn-primary" onClick={onGoToScan}>Scan a menu</button>
      </div>
    );
  }

  return (
    <div>
      <div className="tab-head">
        <h2>{analysis.restaurantName || 'Results'}</h2>
        <p className="muted">{analysis.summary}</p>
        {analysis.note && <p className="note">{analysis.note}</p>}
      </div>
      <div className="menu-card">
        <div className="menu-card-head">
          <span className="menu-card-title">Ranked for you</span>
          <span className="menu-card-legend">dish ··· match score</span>
        </div>
        <div id="dish-list">
          {analysis.dishes.map((d, i) => (
            <DishRow
              key={i}
              dish={d}
              restaurantName={analysis.restaurantName}
              userAllergies={user.profile?.allergies}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
