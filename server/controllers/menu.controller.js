const Analysis = require('../models/Analysis');
const { analyzeMenu } = require('../lib/nutrition-engine');
const { parseMenuText, DEMO_MENU } = require('../lib/menu-parser');
const { parseMenuWithGemini } = require('../lib/gemini');

const HISTORY_CAP = 20;

async function analyze(req, res) {
  const user = req.user;
  if (!user.profile) return res.status(400).json({ error: 'Complete your health profile first.' });

  const body = req.body || {};
  let dishes = [];
  let source = 'text';
  let note = null;

  try {
    if (body.imageData) {
      // Real OCR + nutrition analysis via Gemini
      dishes = await parseMenuWithGemini({
        imageData: body.imageData,
        mimeType: body.mimeType
      });
      source = 'image';
    } else if (body.menuText && String(body.menuText).trim()) {
      // Real text nutrition analysis via Gemini
      dishes = await parseMenuWithGemini({
        menuText: String(body.menuText)
      });
      source = body.sourceType === 'pdf' ? 'pdf' : 'text';
    } else if (body.isImage) {
      // Fallback for legacy simulated OCR
      dishes = DEMO_MENU;
      source = 'image-demo';
      note = 'Showing representative sample menu.';
    } else {
      return res.status(400).json({ error: 'Upload a menu file or paste menu text.' });
    }

    if (!dishes || dishes.length === 0) {
      return res.status(400).json({ error: 'No dishes recognized. Please try a different photo or text.' });
    }
  } catch (geminiError) {
    console.error('Gemini processing failed:', geminiError);
    return res.status(500).json({ error: 'Failed to analyze the menu via AI. Please check your API key and connection.' });
  }

  const result = analyzeMenu(dishes, user.profile);

  const analysis = await Analysis.create({
    userId: user._id,
    restaurantName: String(body.restaurantName || '').trim() || 'Untitled menu',
    source,
    note,
    summary: result.summary,
    energy: result.energy,
    dishes: result.dishes,
  });

  // Keep only the most recent HISTORY_CAP analyses per user.
  const count = await Analysis.countDocuments({ userId: user._id });
  if (count > HISTORY_CAP) {
    const stale = await Analysis.find({ userId: user._id })
      .sort({ createdAt: 1 })
      .limit(count - HISTORY_CAP)
      .select('_id');
    await Analysis.deleteMany({ _id: { $in: stale.map((d) => d._id) } });
  }

  res.status(200).json({ analysis: analysis.toJSON() });
}

async function history(req, res) {
  const docs = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const analyses = docs.map((a) => ({
    id: String(a._id),
    restaurantName: a.restaurantName,
    createdAt: a.createdAt,
    summary: a.summary,
    dishCount: a.dishes.length,
  }));
  res.status(200).json({ analyses });
}

async function historyDetail(req, res) {
  const a = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
  if (!a) return res.status(404).json({ error: 'Analysis not found.' });
  res.status(200).json({ analysis: a.toJSON() });
}

module.exports = { analyze, history, historyDetail };
