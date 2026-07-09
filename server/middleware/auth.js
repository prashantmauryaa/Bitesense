/**
 * Bite Sense — auth middleware.
 * Verifies the bearer token (same HMAC-signed-token scheme as the original
 * zero-dependency build) and attaches the Mongo user document to req.user.
 */
const { verifyToken } = require('../lib/auth');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Sign in to continue.' });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Sign in to continue.' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sign in to continue.' });
  }
}

module.exports = { requireAuth };
