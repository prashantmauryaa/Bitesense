/**
 * Bite Sense — zero-dependency auth utilities.
 * Password hashing via crypto.scrypt, tokens via HMAC-SHA256 signed payloads
 * (same shape as a JWT: base64url(payload).signature).
 */
const crypto = require('crypto');

const SECRET = process.env.BS_SECRET || 'bitesense-dev-secret-change-in-production';
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ---------- passwords ----------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

// ---------- tokens ----------

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

function issueToken(userId) {
  const payload = b64url(JSON.stringify({ sub: userId, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.sub || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, issueToken, verifyToken };
