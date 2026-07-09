/**
 * Bite Sense — simulated AI nutrition engine.
 *
 * Estimates nutrition for menu dishes from their names/descriptions using a
 * keyword knowledge base, then scores each dish against the user's health
 * profile (energy needs, goal, dietary preference, allergies, medical
 * conditions) and generates a human-readable explanation.
 *
 * This module is deterministic and self-contained — no external APIs.
 * To upgrade to a real AI backend, replace analyzeDish() with an LLM call
 * and keep the same output shape.
 */

// ---------------------------------------------------------------------------
// Knowledge base
// ---------------------------------------------------------------------------

// Base dish archetypes. First match (by keyword) sets the nutrition baseline.
// Nutrition is per typical restaurant serving.
const DISH_BASES = [
  { keys: ['salad'], cal: 320, protein: 12, carbs: 18, fat: 20, fiber: 6, sodium: 480, sugar: 6, veg: true, tags: ['fresh'] },
  { keys: ['soup', 'broth', 'shorba', 'bisque', 'chowder'], cal: 260, protein: 10, carbs: 22, fat: 12, fiber: 3, sodium: 900, sugar: 5, veg: true, tags: [] },
  { keys: ['burger'], cal: 750, protein: 32, carbs: 52, fat: 44, fiber: 3, sodium: 1100, sugar: 9, veg: false, tags: ['heavy'] },
  { keys: ['pizza'], cal: 850, protein: 30, carbs: 95, fat: 38, fiber: 4, sodium: 1700, sugar: 10, veg: true, gluten: true, dairy: true, tags: ['heavy'] },
  { keys: ['pasta', 'spaghetti', 'penne', 'fettuccine', 'lasagna', 'linguine', 'ravioli', 'mac and cheese', 'macaroni'], cal: 720, protein: 22, carbs: 88, fat: 28, fiber: 4, sodium: 950, sugar: 8, veg: true, gluten: true, tags: [] },
  { keys: ['biryani', 'pulao', 'fried rice', 'risotto', 'paella'], cal: 650, protein: 20, carbs: 85, fat: 24, fiber: 3, sodium: 1050, sugar: 4, veg: true, tags: [] },
  { keys: ['steak', 'ribeye', 'sirloin', 'filet mignon', 'lamb chop', 'ribs'], cal: 680, protein: 52, carbs: 8, fat: 46, fiber: 1, sodium: 750, sugar: 2, veg: false, tags: ['high-protein'] },
  { keys: ['grilled chicken', 'chicken breast', 'tandoori chicken', 'chicken tikka', 'roast chicken'], cal: 420, protein: 45, carbs: 8, fat: 18, fiber: 1, sodium: 700, sugar: 2, veg: false, tags: ['high-protein', 'lean'] },
  { keys: ['chicken'], cal: 550, protein: 38, carbs: 25, fat: 30, fiber: 2, sodium: 850, sugar: 4, veg: false, tags: [] },
  { keys: ['salmon', 'trout', 'tuna steak', 'grilled fish', 'fish tikka', 'sea bass', 'halibut', 'cod'], cal: 450, protein: 40, carbs: 6, fat: 26, fiber: 1, sodium: 600, sugar: 1, veg: false, fish: true, tags: ['high-protein', 'omega-3', 'lean'] },
  { keys: ['fish and chips', 'fish & chips'], cal: 840, protein: 32, carbs: 78, fat: 46, fiber: 4, sodium: 1200, sugar: 3, veg: false, fish: true, fried: true, gluten: true, tags: ['heavy'] },
  { keys: ['fish', 'seafood'], cal: 480, protein: 36, carbs: 14, fat: 24, fiber: 1, sodium: 700, sugar: 2, veg: false, fish: true, tags: ['high-protein'] },
  { keys: ['shrimp', 'prawn', 'lobster', 'crab', 'oyster', 'mussel', 'calamari', 'squid', 'scallop'], cal: 380, protein: 30, carbs: 18, fat: 18, fiber: 1, sodium: 900, sugar: 2, veg: false, shellfish: true, tags: ['high-protein'] },
  { keys: ['sushi', 'sashimi', 'maki', 'nigiri'], cal: 400, protein: 22, carbs: 55, fat: 10, fiber: 2, sodium: 850, sugar: 8, veg: false, fish: true, tags: ['lean'] },
  { keys: ['taco', 'burrito', 'quesadilla', 'enchilada', 'fajita'], cal: 620, protein: 26, carbs: 62, fat: 30, fiber: 6, sodium: 1150, sugar: 5, veg: false, gluten: true, tags: [] },
  { keys: ['sandwich', 'sub', 'panini', 'wrap', 'club'], cal: 540, protein: 24, carbs: 52, fat: 26, fiber: 3, sodium: 1000, sugar: 6, veg: false, gluten: true, tags: [] },
  { keys: ['curry', 'masala', 'korma', 'vindaloo', 'tikka masala', 'butter chicken', 'dal makhani'], cal: 580, protein: 24, carbs: 34, fat: 38, fiber: 5, sodium: 950, sugar: 7, veg: true, tags: [] },
  { keys: ['dal', 'lentil', 'chana', 'rajma', 'chole'], cal: 380, protein: 18, carbs: 48, fat: 12, fiber: 12, sodium: 700, sugar: 4, veg: true, vegan: true, tags: ['fiber-rich', 'plant-protein'] },
  { keys: ['paneer'], cal: 520, protein: 24, carbs: 22, fat: 38, fiber: 3, sodium: 800, sugar: 6, veg: true, dairy: true, tags: [] },
  { keys: ['tofu', 'tempeh'], cal: 380, protein: 24, carbs: 20, fat: 22, fiber: 4, sodium: 750, sugar: 4, veg: true, vegan: true, soy: true, tags: ['plant-protein', 'lean'] },
  { keys: ['noodle', 'ramen', 'pad thai', 'chow mein', 'lo mein', 'udon', 'pho'], cal: 640, protein: 22, carbs: 82, fat: 24, fiber: 3, sodium: 1500, sugar: 9, veg: true, gluten: true, tags: [] },
  { keys: ['dosa', 'idli', 'uttapam'], cal: 380, protein: 10, carbs: 62, fat: 12, fiber: 3, sodium: 600, sugar: 3, veg: true, vegan: true, tags: ['light'] },
  { keys: ['omelette', 'omelet', 'scrambled egg', 'frittata', 'eggs benedict', 'shakshuka'], cal: 420, protein: 24, carbs: 10, fat: 32, fiber: 1, sodium: 700, sugar: 3, veg: true, egg: true, tags: ['high-protein'] },
  { keys: ['pancake', 'waffle', 'french toast', 'crepe'], cal: 620, protein: 12, carbs: 88, fat: 24, fiber: 2, sodium: 700, sugar: 38, veg: true, gluten: true, egg: true, dairy: true, tags: ['sweet'] },
  { keys: ['cake', 'brownie', 'cheesecake', 'pastry', 'tart', 'pie', 'tiramisu', 'mousse', 'pudding', 'gulab jamun', 'ice cream', 'sundae', 'donut', 'doughnut', 'churros', 'baklava'], cal: 540, protein: 7, carbs: 68, fat: 28, fiber: 1, sodium: 350, sugar: 48, veg: true, gluten: true, dairy: true, dessert: true, tags: ['sweet'] },
  { keys: ['smoothie', 'juice', 'shake', 'lassi', 'milkshake'], cal: 320, protein: 8, carbs: 58, fat: 8, fiber: 2, sodium: 150, sugar: 46, veg: true, drink: true, tags: ['sweet'] },
  { keys: ['fries', 'chips', 'wedges', 'onion rings', 'hash brown'], cal: 460, protein: 5, carbs: 58, fat: 24, fiber: 4, sodium: 700, sugar: 1, veg: true, vegan: true, fried: true, tags: ['side'] },
  { keys: ['wings', 'nuggets', 'tenders', 'popcorn chicken', 'pakora', 'samosa', 'spring roll', 'tempura', 'croquette', 'fritter'], cal: 560, protein: 24, carbs: 36, fat: 36, fiber: 2, sodium: 1100, sugar: 3, veg: false, fried: true, tags: [] },
  { keys: ['hummus', 'falafel', 'mezze'], cal: 420, protein: 14, carbs: 42, fat: 24, fiber: 8, sodium: 650, sugar: 3, veg: true, vegan: true, tags: ['fiber-rich', 'plant-protein'] },
  { keys: ['bowl', 'poke', 'buddha bowl', 'grain bowl'], cal: 520, protein: 26, carbs: 58, fat: 20, fiber: 8, sodium: 750, sugar: 8, veg: true, tags: ['balanced', 'fresh'] },
  { keys: ['oatmeal', 'porridge', 'muesli', 'granola', 'acai'], cal: 380, protein: 10, carbs: 62, fat: 12, fiber: 7, sodium: 200, sugar: 22, veg: true, tags: ['fiber-rich'] },
  { keys: ['rice'], cal: 340, protein: 6, carbs: 72, fat: 4, fiber: 2, sodium: 400, sugar: 1, veg: true, vegan: true, tags: ['side'] },
  { keys: ['bread', 'naan', 'roti', 'paratha', 'garlic bread', 'focaccia', 'baguette'], cal: 320, protein: 8, carbs: 52, fat: 10, fiber: 2, sodium: 550, sugar: 3, veg: true, gluten: true, tags: ['side'] },
];

// Fallback when nothing matches.
const DEFAULT_BASE = { cal: 500, protein: 20, carbs: 45, fat: 25, fiber: 3, sodium: 800, sugar: 6, veg: false, tags: [] };

// Modifiers adjust the baseline when their keywords appear anywhere in the text.
const MODIFIERS = [
  { keys: ['fried', 'crispy', 'battered', 'breaded', 'deep-fried', 'deep fried', 'crunchy'], cal: 1.35, fat: 1.6, sodium: 1.2, flag: 'fried' },
  { keys: ['creamy', 'cream', 'alfredo', 'carbonara', 'makhani', 'butter', 'béchamel', 'bechamel'], cal: 1.25, fat: 1.5, dairy: true, flag: 'creamy' },
  { keys: ['cheese', 'cheesy', 'mozzarella', 'cheddar', 'parmesan', 'gouda', 'feta', 'burrata'], cal: 1.2, fat: 1.35, sodium: 1.15, dairy: true, flag: 'cheesy' },
  { keys: ['grilled', 'roasted', 'baked', 'steamed', 'poached', 'seared', 'char-grilled', 'chargrilled'], cal: 0.92, fat: 0.85, flag: 'lean-cooked' },
  { keys: ['bacon', 'sausage', 'pepperoni', 'salami', 'chorizo', 'ham', 'prosciutto', 'pastrami'], cal: 1.2, fat: 1.4, sodium: 1.4, meat: true, processed: true, flag: 'processed-meat' },
  { keys: ['spicy', 'chili', 'chilli', 'hot sauce', 'jalapeño', 'jalapeno', 'peri peri', 'sriracha', 'szechuan', 'schezwan'], sodium: 1.1, flag: 'spicy' },
  { keys: ['sweet', 'honey', 'glazed', 'caramel', 'chocolate', 'syrup', 'bbq', 'teriyaki'], sugar: 1.8, cal: 1.1, flag: 'sugary' },
  { keys: ['avocado', 'quinoa', 'kale', 'spinach', 'broccoli', 'veggie', 'vegetable', 'greens', 'beet', 'superfood'], fiber: 1.5, flag: 'veg-forward' },
  { keys: ['whole wheat', 'whole grain', 'multigrain', 'brown rice'], fiber: 1.6, flag: 'whole-grain' },
  { keys: ['double', 'loaded', 'jumbo', 'xl', 'supreme', 'monster', 'ultimate'], cal: 1.4, fat: 1.4, sodium: 1.3, flag: 'oversized' },
  { keys: ['light', 'lite', 'skinny', 'low-cal', 'low cal', 'diet'], cal: 0.75, fat: 0.7, sugar: 0.7, flag: 'light' },
];

// Allergen detection keywords (beyond base flags).
const ALLERGEN_KEYWORDS = {
  nuts: ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'nut', 'praline', 'satay'],
  dairy: ['cheese', 'cream', 'butter', 'milk', 'paneer', 'yogurt', 'yoghurt', 'ghee', 'mozzarella', 'parmesan', 'burrata', 'lassi', 'ice cream'],
  gluten: ['bread', 'pasta', 'noodle', 'wheat', 'naan', 'roti', 'bun', 'tortilla', 'battered', 'breaded', 'pizza', 'wrap', 'sandwich', 'burger', 'cake', 'pastry', 'pancake', 'waffle', 'flour'],
  shellfish: ['shrimp', 'prawn', 'lobster', 'crab', 'oyster', 'mussel', 'clam', 'calamari', 'squid', 'scallop'],
  soy: ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'teriyaki'],
  egg: ['egg', 'omelette', 'omelet', 'mayo', 'mayonnaise', 'aioli', 'meringue', 'frittata'],
};

const MEAT_KEYWORDS = ['chicken', 'beef', 'pork', 'lamb', 'mutton', 'turkey', 'duck', 'bacon', 'sausage', 'pepperoni', 'salami', 'chorizo', 'ham', 'steak', 'ribs', 'meat', 'keema', 'kebab', 'prosciutto', 'pastrami', 'veal'];
const FISH_KEYWORDS = ['fish', 'salmon', 'tuna', 'trout', 'cod', 'halibut', 'sea bass', 'sardine', 'anchovy', 'mackerel', 'sushi', 'sashimi'];

// ---------------------------------------------------------------------------
// Profile energy math
// ---------------------------------------------------------------------------

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function computeEnergyNeeds(profile) {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = profile;
  // Mifflin-St Jeor
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.375);

  let targetCalories = tdee;
  if (goal === 'lose_weight') targetCalories = tdee - 450;
  if (goal === 'gain_muscle') targetCalories = tdee + 300;
  targetCalories = Math.max(1200, Math.round(targetCalories));

  // A restaurant meal is budgeted at ~35% of the day's calories.
  const mealBudget = Math.round(targetCalories * 0.35);
  const proteinTargetPerMeal = Math.round((goal === 'gain_muscle' ? 2.0 : 1.4) * weightKg * 0.35);

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories, mealBudget, proteinTargetPerMeal };
}

// ---------------------------------------------------------------------------
// Dish analysis
// ---------------------------------------------------------------------------

function matchBase(text) {
  for (const base of DISH_BASES) {
    for (const key of base.keys) {
      if (text.includes(key)) return { ...base, matchedKey: key };
    }
  }
  return { ...DEFAULT_BASE, matchedKey: null };
}

function estimateNutrition(name, description) {
  const text = `${name} ${description || ''}`.toLowerCase();
  const base = matchBase(text);

  let n = { calories: base.cal, protein: base.protein, carbs: base.carbs, fat: base.fat, fiber: base.fiber, sodium: base.sodium, sugar: base.sugar };
  const flags = new Set(base.tags || []);
  const props = {
    dairy: !!base.dairy, gluten: !!base.gluten, egg: !!base.egg, soy: !!base.soy,
    shellfish: !!base.shellfish, fish: !!base.fish, fried: !!base.fried,
    dessert: !!base.dessert, drink: !!base.drink,
    vegBase: !!base.veg, veganBase: !!base.vegan,
  };

  for (const mod of MODIFIERS) {
    if (mod.keys.some((k) => text.includes(k))) {
      if (mod.cal) n.calories *= mod.cal;
      if (mod.fat) n.fat *= mod.fat;
      if (mod.sodium) n.sodium *= mod.sodium;
      if (mod.sugar) n.sugar *= mod.sugar;
      if (mod.fiber) n.fiber *= mod.fiber;
      if (mod.dairy) props.dairy = true;
      if (mod.meat) props.meat = true;
      if (mod.processed) props.processed = true;
      if (mod.flag === 'fried') props.fried = true;
      flags.add(mod.flag);
    }
  }

  // Allergens from keywords
  const allergens = [];
  for (const [allergen, keys] of Object.entries(ALLERGEN_KEYWORDS)) {
    if (keys.some((k) => text.includes(k))) allergens.push(allergen);
  }
  if (props.dairy && !allergens.includes('dairy')) allergens.push('dairy');
  if (props.gluten && !allergens.includes('gluten')) allergens.push('gluten');
  if (props.shellfish && !allergens.includes('shellfish')) allergens.push('shellfish');
  if (props.egg && !allergens.includes('egg')) allergens.push('egg');
  if (props.soy && !allergens.includes('soy')) allergens.push('soy');

  const containsMeat = props.meat || MEAT_KEYWORDS.some((k) => text.includes(k));
  const containsFish = props.fish || FISH_KEYWORDS.some((k) => text.includes(k)) || allergens.includes('shellfish');
  const containsEgg = allergens.includes('egg');
  const containsDairy = allergens.includes('dairy');

  // Round everything sensibly
  n = {
    calories: Math.round(n.calories / 10) * 10,
    protein: Math.round(n.protein),
    carbs: Math.round(n.carbs),
    fat: Math.round(n.fat),
    fiber: Math.round(n.fiber),
    sodium: Math.round(n.sodium / 10) * 10,
    sugar: Math.round(n.sugar),
  };

  return { nutrition: n, allergens, flags: [...flags], containsMeat, containsFish, containsEgg, containsDairy, fried: props.fried, dessert: props.dessert, drink: props.drink, matchedKey: base.matchedKey };
}

// ---------------------------------------------------------------------------
// Scoring against the profile
// ---------------------------------------------------------------------------

function scoreDish(dishInfo, profile, energy) {
  const { nutrition: n, allergens, containsMeat, containsFish, containsEgg, containsDairy, fried, dessert, flags } = dishInfo;
  const reasons = [];
  const warnings = [];
  let score = 70;

  // --- Dietary preference -------------------------------------------------
  const pref = profile.dietaryPreference || 'none';
  let prefViolation = false;
  if (pref === 'vegetarian' && (containsMeat || containsFish)) {
    prefViolation = true;
    warnings.push('Contains meat or fish — not vegetarian.');
  } else if (pref === 'vegan' && (containsMeat || containsFish || containsEgg || containsDairy)) {
    prefViolation = true;
    warnings.push('Contains animal products — not vegan.');
  } else if (pref === 'pescatarian' && containsMeat) {
    prefViolation = true;
    warnings.push('Contains meat — not pescatarian.');
  } else if ((pref === 'keto' || pref === 'low_carb') && n.carbs > 40) {
    score -= 25;
    warnings.push(`High in carbs (~${n.carbs}g) for a ${pref === 'keto' ? 'keto' : 'low-carb'} plan.`);
  }
  if (prefViolation) score -= 60;

  // --- Allergies (hard warnings) ------------------------------------------
  const userAllergies = (profile.allergies || []).map((a) => a.toLowerCase());
  const allergyHits = allergens.filter((a) => userAllergies.includes(a));
  for (const hit of allergyHits) {
    warnings.push(`⚠ May contain ${hit} — listed in your allergies.`);
  }
  if (allergyHits.length > 0) score = Math.min(score - 55, 12);

  // --- Calorie fit ----------------------------------------------------------
  const budget = energy.mealBudget;
  const ratio = n.calories / budget;
  if (ratio <= 0.85) {
    score += 10;
    reasons.push(`At ~${n.calories} kcal it fits comfortably within your ${budget} kcal meal budget.`);
  } else if (ratio <= 1.1) {
    score += 4;
    reasons.push(`~${n.calories} kcal is right around your ${budget} kcal per-meal budget.`);
  } else if (ratio <= 1.4) {
    score -= 8;
    reasons.push(`~${n.calories} kcal runs over your ${budget} kcal meal budget.`);
  } else {
    score -= 18;
    warnings.push(`Roughly ${Math.round((ratio - 1) * 100)}% over your per-meal calorie budget.`);
  }

  // --- Goal-specific -------------------------------------------------------
  const goal = profile.goal;
  const proteinDensity = n.protein / Math.max(n.calories, 1) * 100; // g per 100 kcal
  if (goal === 'gain_muscle') {
    if (n.protein >= energy.proteinTargetPerMeal) {
      score += 12;
      reasons.push(`Strong protein hit (~${n.protein}g) for your muscle-gain goal.`);
    } else if (proteinDensity < 3) {
      score -= 10;
      reasons.push(`Light on protein (~${n.protein}g) for muscle gain.`);
    }
  }
  if (goal === 'lose_weight') {
    if (fried) { score -= 12; warnings.push('Fried preparation adds substantial calories and fat.'); }
    if (dessert) { score -= 10; }
    if (n.fiber >= 6) { score += 6; reasons.push(`Good fiber (~${n.fiber}g) helps you stay full on fewer calories.`); }
    if (proteinDensity >= 5) { score += 6; reasons.push('High protein-to-calorie ratio supports fat loss while preserving muscle.'); }
  }
  if (goal === 'improve_health' || goal === 'maintain') {
    if (flags.includes('lean-cooked')) { score += 6; reasons.push('Grilled/baked preparation keeps added fats in check.'); }
    if (flags.includes('veg-forward') || flags.includes('fresh')) { score += 5; reasons.push('Vegetable-forward — adds micronutrients and fiber.'); }
    if (flags.includes('omega-3')) { score += 5; reasons.push('Oily fish provides heart-healthy omega-3 fats.'); }
  }

  // --- Medical conditions ---------------------------------------------------
  const conditions = (profile.conditions || []).map((c) => c.toLowerCase());
  if (conditions.includes('diabetes')) {
    if (n.sugar > 20) { score -= 20; warnings.push(`High sugar (~${n.sugar}g) — risky for blood glucose control.`); }
    else if (n.sugar > 10) { score -= 8; warnings.push(`Moderate sugar (~${n.sugar}g) — watch your portion.`); }
    if (n.carbs > 70) { score -= 10; warnings.push(`Very high carb load (~${n.carbs}g) can spike blood sugar.`); }
    if (n.fiber >= 6) { score += 5; reasons.push('Fiber slows glucose absorption — helpful for diabetes.'); }
  }
  if (conditions.includes('hypertension')) {
    if (n.sodium > 1200) { score -= 18; warnings.push(`Very high sodium (~${n.sodium}mg) — a concern for blood pressure.`); }
    else if (n.sodium > 800) { score -= 8; warnings.push(`Moderately high sodium (~${n.sodium}mg).`); }
  }
  if (conditions.includes('heart_disease') || conditions.includes('high_cholesterol')) {
    if (fried) { score -= 15; warnings.push('Fried foods are high in saturated/trans fats — hard on heart health.'); }
    if (n.fat > 40) { score -= 10; warnings.push(`High total fat (~${n.fat}g).`); }
    if (flags.includes('processed-meat')) { score -= 10; warnings.push('Processed meats are linked to cardiovascular risk.'); }
    if (flags.includes('omega-3')) { score += 8; reasons.push('Omega-3 rich — actively good for heart health.'); }
  }
  if (conditions.includes('kidney_disease')) {
    if (n.sodium > 800) { score -= 12; warnings.push(`Sodium (~${n.sodium}mg) should be limited with kidney disease.`); }
    if (n.protein > 40) { score -= 8; warnings.push('Very high protein loads can strain kidney function.'); }
  }

  // --- General quality signals ----------------------------------------------
  if (flags.includes('oversized')) { score -= 6; }
  if (flags.includes('light')) { score += 4; }
  if (flags.includes('whole-grain')) { score += 4; reasons.push('Whole grains digest slowly and add fiber.'); }
  if (flags.includes('balanced')) { score += 5; reasons.push('Balanced bowl format: protein, grains, and vegetables together.'); }

  score = Math.max(2, Math.min(98, Math.round(score)));

  let verdict;
  if (allergyHits.length > 0) verdict = 'Avoid';
  else if (score >= 80) verdict = 'Great match';
  else if (score >= 65) verdict = 'Good choice';
  else if (score >= 45) verdict = 'Okay in moderation';
  else if (score >= 25) verdict = 'Caution';
  else verdict = 'Avoid';

  return { score, verdict, reasons, warnings, allergyHits };
}

// ---------------------------------------------------------------------------
// Explanations & alternatives
// ---------------------------------------------------------------------------

function buildExplanation(dish, analysis, profile) {
  const parts = [];
  if (analysis.allergyHits.length > 0) {
    parts.push(`This dish likely contains ${analysis.allergyHits.join(' and ')}, which you've flagged as an allergy — we recommend avoiding it or confirming ingredients with the restaurant.`);
  }
  if (analysis.reasons.length > 0) parts.push(analysis.reasons.slice(0, 3).join(' '));
  if (analysis.warnings.length > 0 && analysis.allergyHits.length === 0) {
    parts.push(analysis.warnings.slice(0, 2).join(' '));
  }
  if (parts.length === 0) {
    parts.push('A reasonable middle-of-the-road option — nothing outstanding, nothing alarming for your profile.');
  }
  return parts.join(' ');
}

function suggestAlternative(dish, allDishes) {
  // Suggest the highest-scored other dish that beats this one by 15+ points.
  const better = allDishes
    .filter((d) => d.name !== dish.name && d.score >= dish.score + 15)
    .sort((a, b) => b.score - a.score)[0];
  if (better) return `Try "${better.name}" instead — it scores ${better.score}/100 for your profile.`;
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function analyzeMenu(dishes, profile) {
  const energy = computeEnergyNeeds(profile);

  const analyzed = dishes.map((dish) => {
    const info = estimateNutrition(dish.name, dish.description);
    const scored = scoreDish(info, profile, energy);
    return {
      name: dish.name,
      description: dish.description || '',
      nutrition: info.nutrition,
      allergens: info.allergens,
      score: scored.score,
      verdict: scored.verdict,
      warnings: scored.warnings,
      reasons: scored.reasons,
      allergyHits: scored.allergyHits,
    };
  });

  // Explanations + alternatives need the full ranked list.
  for (const dish of analyzed) {
    dish.explanation = buildExplanation(dish, dish, profile);
    const alt = suggestAlternative(dish, analyzed);
    if (alt && dish.score < 65) dish.alternative = alt;
    delete dish.allergyHits;
    delete dish.reasons;
  }

  analyzed.sort((a, b) => b.score - a.score);

  return {
    energy,
    dishes: analyzed,
    summary: buildMenuSummary(analyzed, profile, energy),
  };
}

function buildMenuSummary(dishes, profile, energy) {
  const great = dishes.filter((d) => d.score >= 80).length;
  const avoid = dishes.filter((d) => d.verdict === 'Avoid').length;
  const top = dishes[0];
  const goalText = {
    lose_weight: 'weight loss', gain_muscle: 'muscle gain',
    maintain: 'maintenance', improve_health: 'overall health',
  }[profile.goal] || 'your goals';
  let s = `Analyzed ${dishes.length} dishes against your ${goalText} plan (~${energy.mealBudget} kcal per meal). `;
  if (top) s += `Best pick: "${top.name}" (${top.score}/100). `;
  if (great > 0) s += `${great} dish${great > 1 ? 'es' : ''} scored 80+. `;
  if (avoid > 0) s += `${avoid} flagged to avoid.`;
  return s.trim();
}

module.exports = { analyzeMenu, computeEnergyNeeds };
