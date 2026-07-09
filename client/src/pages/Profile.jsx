import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const ALLERGY_OPTIONS = ['nuts', 'dairy', 'gluten', 'shellfish', 'soy', 'egg'];
const CONDITION_OPTIONS = ['diabetes', 'hypertension', 'heart_disease', 'high_cholesterol', 'kidney_disease'];
const ALLERGY_LABELS = { nuts: 'Nuts', dairy: 'Dairy', gluten: 'Gluten', shellfish: 'Shellfish', soy: 'Soy', egg: 'Egg' };
const CONDITION_LABELS = {
  diabetes: 'Diabetes', hypertension: 'Hypertension', heart_disease: 'Heart disease',
  high_cholesterol: 'High cholesterol', kidney_disease: 'Kidney disease',
};

const EMPTY_FORM = {
  age: '', gender: '', heightCm: '', weightKg: '',
  activityLevel: '', goal: '', dietaryPreference: 'none',
  allergies: [], conditions: [],
};

export default function Profile() {
  const { user, updateUser, api } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const p = user.profile;
    if (!p) return;
    setForm({
      age: p.age, gender: p.gender, heightCm: p.heightCm, weightKg: p.weightKg,
      activityLevel: p.activityLevel, goal: p.goal, dietaryPreference: p.dietaryPreference,
      allergies: p.allergies || [], conditions: p.conditions || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.profile]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggle(field, value) {
    setForm((f) => {
      const list = f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value];
      return { ...f, [field]: list };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const data = await api('/api/profile', { method: 'PUT', body: form });
      updateUser({ profile: data.profile });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="tab-head">
        <h2>Health profile</h2>
        <p className="muted">Everything here shapes your dish scores. Update it any time your goals change.</p>
      </div>
      <form className="profile-grid" onSubmit={handleSubmit}>
        <div className="pf-section">
          <h3>About you</h3>
          <div className="pf-row">
            <div className="field">
              <label htmlFor="pf-age">Age</label>
              <input type="number" id="pf-age" min="10" max="100" required placeholder="28"
                value={form.age} onChange={(e) => set('age', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-gender">Gender</label>
              <select id="pf-gender" required value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="pf-row">
            <div className="field">
              <label htmlFor="pf-height">Height (cm)</label>
              <input type="number" id="pf-height" min="100" max="250" required placeholder="172"
                value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-weight">Weight (kg)</label>
              <input type="number" id="pf-weight" min="25" max="300" required placeholder="70"
                value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="pf-activity">Activity level</label>
            <select id="pf-activity" required value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}>
              <option value="" disabled>Select</option>
              <option value="sedentary">Sedentary — desk job, little exercise</option>
              <option value="light">Light — exercise 1–3 days/week</option>
              <option value="moderate">Moderate — exercise 3–5 days/week</option>
              <option value="active">Active — exercise 6–7 days/week</option>
              <option value="very_active">Very active — hard training daily</option>
            </select>
          </div>
        </div>

        <div className="pf-section">
          <h3>Goals &amp; diet</h3>
          <div className="field">
            <label htmlFor="pf-goal">Fitness goal</label>
            <select id="pf-goal" required value={form.goal} onChange={(e) => set('goal', e.target.value)}>
              <option value="" disabled>Select</option>
              <option value="lose_weight">Lose weight</option>
              <option value="maintain">Maintain weight</option>
              <option value="gain_muscle">Gain muscle</option>
              <option value="improve_health">Improve overall health</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-pref">Dietary preference</label>
            <select id="pf-pref" required value={form.dietaryPreference} onChange={(e) => set('dietaryPreference', e.target.value)}>
              <option value="none">No restriction</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="keto">Keto</option>
              <option value="low_carb">Low carb</option>
            </select>
          </div>
          <div className="field">
            <label>Allergies</label>
            <div className="chip-group" id="pf-allergies">
              {ALLERGY_OPTIONS.map((v) => (
                <label className="chip" key={v}>
                  <input type="checkbox" value={v} checked={form.allergies.includes(v)} onChange={() => toggle('allergies', v)} />
                  {ALLERGY_LABELS[v]}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Medical conditions</label>
            <div className="chip-group" id="pf-conditions">
              {CONDITION_OPTIONS.map((v) => (
                <label className="chip" key={v}>
                  <input type="checkbox" value={v} checked={form.conditions.includes(v)} onChange={() => toggle('conditions', v)} />
                  {CONDITION_LABELS[v]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pf-footer">
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Profile saved. Your scores will use these numbers.</p>}
          <button type="submit" className="btn btn-primary">Save profile</button>
        </div>
      </form>
    </>
  );
}
