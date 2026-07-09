const Meal = require('../models/Meal');

async function create(req, res) {
  const { dish, restaurantName } = req.body || {};
  if (!dish || !dish.name) return res.status(400).json({ error: 'Nothing to save.' });

  const meal = await Meal.create({
    userId: req.user._id,
    restaurantName: String(restaurantName || ''),
    dish,
    savedAt: new Date(),
  });
  res.status(200).json({ meal: meal.toJSON() });
}

async function list(req, res) {
  const meals = await Meal.find({ userId: req.user._id }).sort({ savedAt: -1 });
  res.status(200).json({ meals: meals.map((m) => m.toJSON()) });
}

async function remove(req, res) {
  const result = await Meal.deleteOne({ _id: req.params.id, userId: req.user._id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Meal not found.' });
  res.status(200).json({ ok: true });
}

module.exports = { create, list, remove };
