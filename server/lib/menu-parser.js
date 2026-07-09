/**
 * Bite Sense — menu text parser.
 * Turns raw menu text (pasted, or extracted from a PDF) into structured
 * dish entries: { name, description }.
 */

const SECTION_WORDS = [
  'starters', 'appetizers', 'appetisers', 'mains', 'main course', 'entrees', 'entrées',
  'desserts', 'beverages', 'drinks', 'sides', 'salads', 'soups', 'breakfast', 'lunch',
  'dinner', 'specials', 'menu', 'combos', 'snacks', 'veg', 'non-veg', 'non veg',
  'chef recommends', 'signature', "today's special", 'kids menu', 'pizzas', 'pastas',
  'burgers', 'sandwiches', 'wraps', 'rice & noodles', 'tandoor', 'curries', 'breads',
  'desserts & drinks',
];

const PRICE_RE = /(?:[$₹€£¥]|rs\.?|inr|usd)\s*\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{2})?\s*(?:[$₹€£¥]|rs\.?|\/-)|(?<=\s)\d{2,4}(?:[.,]\d{2})?\s*$/gi;

function cleanLine(line) {
  return line
    .replace(/\.{2,}/g, ' ')          // dotted leaders
    .replace(PRICE_RE, '')             // prices
    .replace(/\s{2,}/g, ' ')
    .replace(/[•·*_~#>]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function isSectionHeader(line) {
  const l = line.toLowerCase().replace(/[^a-z\s&'-]/g, '').trim();
  if (!l) return true;
  if (SECTION_WORDS.some((w) => l === w || l === w + 's')) return true;
  // ALL-CAPS short lines with no descriptors are usually headers
  if (line === line.toUpperCase() && line.length < 28 && !/\d/.test(line) && line.split(' ').length <= 3) return true;
  return false;
}

function looksLikeDish(line) {
  if (line.length < 3 || line.length > 120) return false;
  const words = line.split(/\s+/).length;
  if (words > 18) return false;
  if (/^(open|closed|call|visit|www\.|http|tel|phone|address|follow us|thank)/i.test(line)) return false;
  return true;
}

/**
 * Parse raw menu text into dishes.
 * Heuristics:
 *  - a line that survives cleaning and isn't a section header is a dish name
 *  - "Name - description" / "Name: description" lines are split apart
 *  - a following longer/lowercase line becomes the previous dish's description
 */
function parseMenuText(raw) {
  const lines = raw.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const dishes = [];
  let current = null;

  for (const line of lines) {
    if (isSectionHeader(line)) continue;

    const words = line.split(/\s+/).length;
    const startsLower = /^[a-z]/.test(line);
    const isDescription = current && (startsLower || words > 10) && !current.description && !/[-–—:|]/.test(line.slice(0, 40));

    if (isDescription) {
      current.description = line;
      continue;
    }

    if (looksLikeDish(line)) {
      // Split "Dish Name - description of the dish" into name + description
      const sepMatch = line.match(/^(.{3,60}?)\s*(?:\s[-–—|]\s?|[–—:|]\s)\s*(.{6,})$/);
      if (sepMatch && sepMatch[1].split(/\s+/).length <= 7) {
        current = { name: titleCase(sepMatch[1].trim()), description: sepMatch[2].trim() };
      } else {
        current = { name: titleCase(line), description: '' };
      }
      dishes.push(current);
    }
  }

  // De-duplicate by name
  const seen = new Set();
  return dishes.filter((d) => {
    const k = d.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 60); // sanity cap
}

function titleCase(s) {
  if (s === s.toUpperCase()) {
    return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Demo menu used when an image is uploaded (simulated OCR). */
const DEMO_MENU = [
  { name: 'Grilled Chicken Caesar Salad', description: 'romaine, parmesan, char-grilled chicken breast, caesar dressing' },
  { name: 'Margherita Pizza', description: 'fresh mozzarella, basil, san marzano tomato sauce' },
  { name: 'Butter Chicken with Naan', description: 'creamy tomato makhani gravy, tandoor chicken, buttered naan' },
  { name: 'Quinoa Buddha Bowl', description: 'quinoa, roasted vegetables, avocado, hummus, greens' },
  { name: 'Crispy Fried Chicken Burger', description: 'battered chicken thigh, cheese, mayo, brioche bun, fries' },
  { name: 'Grilled Salmon', description: 'seared atlantic salmon, steamed broccoli, lemon butter' },
  { name: 'Paneer Tikka Masala', description: 'cottage cheese in spiced creamy tomato gravy' },
  { name: 'Dal Tadka with Brown Rice', description: 'yellow lentils tempered with garlic, served with brown rice' },
  { name: 'Pad Thai Noodles', description: 'rice noodles, peanuts, tamarind sauce, prawns, egg' },
  { name: 'Chocolate Brownie Sundae', description: 'warm brownie, vanilla ice cream, chocolate syrup' },
  { name: 'Fresh Fruit Smoothie', description: 'banana, mango, honey, yogurt' },
  { name: 'Steamed Veg Momos', description: 'steamed dumplings stuffed with vegetables, spicy chutney' },
];

module.exports = { parseMenuText, DEMO_MENU };
