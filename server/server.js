/**
 * Bite Sense — Express + MongoDB API.
 * Run: node server.js  →  API on http://localhost:3000
 * (Serves the React client separately in dev via Vite; in production, point
 * PUBLIC_DIR below at the built client/dist folder and this server can serve
 * both API and static files, same as the original zero-dependency build.)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const menuRoutes = require('./routes/menu.routes');
const mealsRoutes = require('./routes/meals.routes');

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '5mb' }));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => res.status(200).json({ ok: true, service: 'bitesense' }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/meals', mealsRoutes);

// ---------------------------------------------------------------------------
// Serve the built React client in production (client/dist), if present.
// In development, run the Vite dev server separately (see client/package.json)
// and it will proxy /api requests here — this static block is a no-op then.
// ---------------------------------------------------------------------------
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// ---------------------------------------------------------------------------
// 404 + error handling
// ---------------------------------------------------------------------------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  console.error('Unhandled error:', err);
  if (!res.headersSent) res.status(500).json({ error: 'Something went wrong. Try again.' });
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('\n  ❌ Could not connect to MongoDB:', err.message);
    console.error('     Set MONGODB_URI in server/.env (see .env.example) and try again.\n');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n  🥗 Bite Sense API is running → http://localhost:${PORT}\n`);
  });
}

start();

module.exports = app;
