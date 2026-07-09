import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function EnergyStats() {
  const { user, api } = useAuth();
  const [energy, setEnergy] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!user.profile) {
      setEnergy(null);
      return;
    }
    (async () => {
      try {
        const data = await api('/api/profile');
        if (!cancelled) setEnergy(data.energy || null);
      } catch {
        /* non-fatal */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.profile]);

  if (!user.profile) {
    return <p className="muted small">Save your profile to see daily calorie and protein targets.</p>;
  }
  if (!energy) return null;

  return (
    <div id="energy-stats" className="energy-stats">
      <div className="energy-stat"><div className="es-value">{energy.targetCalories}</div><div className="es-label">kcal / day</div></div>
      <div className="energy-stat"><div className="es-value">{energy.mealBudget}</div><div className="es-label">kcal / meal</div></div>
      <div className="energy-stat"><div className="es-value">{energy.tdee}</div><div className="es-label">TDEE</div></div>
      <div className="energy-stat"><div className="es-value">{energy.bmr}</div><div className="es-label">BMR</div></div>
    </div>
  );
}
