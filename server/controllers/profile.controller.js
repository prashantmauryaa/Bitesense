const { computeEnergyNeeds } = require('../lib/nutrition-engine');

const ALLOWED_ACTIVITY = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const ALLOWED_GOALS = ['lose_weight', 'maintain', 'gain_muscle', 'improve_health'];
const ALLOWED_PREFS = ['none', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'low_carb'];

async function getProfile(req, res) {
  const user = req.user;
  if (!user.profile) return res.status(200).json({ profile: null, energy: null });
  res.status(200).json({ profile: user.profile, energy: computeEnergyNeeds(user.profile) });
}

async function putProfile(req, res) {
  const user = req.user;
  const p = req.body || {};
  const age = Number(p.age), heightCm = Number(p.heightCm), weightKg = Number(p.weightKg);

  if (!age || age < 10 || age > 100) return res.status(400).json({ error: 'Enter an age between 10 and 100.' });
  if (!heightCm || heightCm < 100 || heightCm > 250) return res.status(400).json({ error: 'Enter a height between 100 and 250 cm.' });
  if (!weightKg || weightKg < 25 || weightKg > 300) return res.status(400).json({ error: 'Enter a weight between 25 and 300 kg.' });
  if (!['male', 'female'].includes(p.gender)) return res.status(400).json({ error: 'Select a gender (used for energy calculations).' });
  if (!ALLOWED_ACTIVITY.includes(p.activityLevel)) return res.status(400).json({ error: 'Select an activity level.' });
  if (!ALLOWED_GOALS.includes(p.goal)) return res.status(400).json({ error: 'Select a fitness goal.' });
  if (!ALLOWED_PREFS.includes(p.dietaryPreference)) return res.status(400).json({ error: 'Select a dietary preference.' });

  user.profile = {
    age, gender: p.gender, heightCm, weightKg,
    activityLevel: p.activityLevel,
    goal: p.goal,
    dietaryPreference: p.dietaryPreference,
    allergies: Array.isArray(p.allergies) ? p.allergies.slice(0, 10).map(String) : [],
    conditions: Array.isArray(p.conditions) ? p.conditions.slice(0, 10).map(String) : [],
    updatedAt: new Date(),
  };
  await user.save();
  res.status(200).json({ profile: user.profile, energy: computeEnergyNeeds(user.profile) });
}

module.exports = { getProfile, putProfile };
