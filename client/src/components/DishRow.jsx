import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function scoreClass(score, verdict) {
  if (verdict === 'Avoid') return 'avoid';
  if (score >= 80) return 'great';
  if (score >= 65) return 'good';
  if (score >= 45) return 'ok';
  return 'caution';
}

export default function DishRow({ dish, restaurantName, userAllergies }) {
  const { api } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const cls = scoreClass(dish.score, dish.verdict);

  async function saveMeal() {
    setSaving(true);
    setError('');
    try {
      await api('/api/meals', { method: 'POST', body: { dish, restaurantName } });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dish">
      <button className="dish-row" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="dish-name">{dish.name}</span>
        <span className="dish-leader" />
        <span className={`dish-verdict v-${cls}`}>{dish.verdict}</span>
        <span className={`dish-score s-${cls}`}>{dish.score}<span className="muted small">/100</span></span>
      </button>
      {open && (
        <div className="dish-detail">
          {dish.description && <p className="dish-desc">{dish.description}</p>}
          <div className="nutri-grid">
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.calories}</div><div className="nc-l">kcal</div></div>
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.protein}g</div><div className="nc-l">protein</div></div>
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.carbs}g</div><div className="nc-l">carbs</div></div>
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.fat}g</div><div className="nc-l">fat</div></div>
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.fiber}g</div><div className="nc-l">fiber</div></div>
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.sodium}</div><div className="nc-l">sodium mg</div></div>
            <div className="nutri-cell"><div className="nc-v">{dish.nutrition.sugar}g</div><div className="nc-l">sugar</div></div>
          </div>
          <p className="dish-explain">{dish.explanation}</p>
          {dish.warnings?.length > 0 && (
            <div className="dish-warnings">
              {dish.warnings.map((w, i) => <div className="dish-warning" key={i}>{w}</div>)}
            </div>
          )}
          {dish.alternative && <p className="dish-alt">↳ {dish.alternative}</p>}
          {dish.allergens?.length > 0 && (
            <div className="allergen-tags">
              {dish.allergens.map((al) => (
                <span className={`allergen-tag${(userAllergies || []).includes(al) ? ' hit' : ''}`} key={al}>{al}</span>
              ))}
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <div>
            <button type="button" className="btn btn-ghost btn-sm btn-save-meal" disabled={saving || saved} onClick={saveMeal}>
              {saved ? 'Saved ✓' : 'Save this meal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
