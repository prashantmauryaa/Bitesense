const User = require('../models/User');
const { hashPassword, verifyPassword, issueToken } = require('../lib/auth');

async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const emailNorm = String(email).toLowerCase().trim();

  const existing = await User.findOne({ email: emailNorm });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = await User.create({
    name: String(name).trim().slice(0, 80),
    email: emailNorm,
    passwordHash: hashPassword(String(password)),
    profile: null,
  });

  res.status(200).json({ token: issueToken(String(user._id)), user: user.toJSON() });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  const emailNorm = String(email || '').toLowerCase().trim();
  const user = await User.findOne({ email: emailNorm });
  if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  res.status(200).json({ token: issueToken(String(user._id)), user: user.toJSON() });
}

async function me(req, res) {
  res.status(200).json({ user: req.user.toJSON() });
}

module.exports = { register, login, me };
