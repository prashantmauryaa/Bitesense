# Bite Sense 🥗 

AI-powered restaurant nutrition assistant. Upload a menu, get every dish ranked
against your personal health profile — with a plain-English reason for every score.

This is the **MERN** build (MongoDB, Express, React, Node). It replaces the
original zero-dependency Node/JSON-file build one-for-one: same API, same
scoring logic, same design — just a proper database and a componentized
frontend underneath.

> Migrating from the original build? See [`MIGRATION.md`](./MIGRATION.md) for
> the decisions made during the port and how to import your existing data.

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- A MongoDB connection — either:
  - **Local**: [install MongoDB Community Server](https://www.mongodb.com/try/download/community) and run `mongod`, or
  - **Atlas**: a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) — grab its connection string

## Setup

```bash
# from the project root
npm run install:all          # installs server/ and client/ dependencies

cp server/.env.example server/.env
# then edit server/.env — at minimum set MONGODB_URI
```

## Run it (development)

```bash
npm run dev
```

This starts both processes together:
- **Express API** on `http://localhost:3000`
- **Vite dev server** (React) on `http://localhost:5173`, proxying `/api/*` to the API

Open **http://localhost:5173** in your browser.

## Run it (production-style, single process)

```bash
npm run build     # builds the React app into client/dist
npm start         # builds (again, cheap if unchanged) then starts the Express server
```

`server.js` auto-serves `client/dist` if it exists, so with a build in place you
only need the API running — open **http://localhost:3000**.

## How to use

1. **Create an account** on the landing page.
2. **Fill in your health profile** — age, height/weight, activity level, fitness
   goal, dietary preference, allergies, and medical conditions. This drives all scoring.
3. **Scan a menu** — paste menu text (best results), upload a PDF (text is
   extracted in your browser via pdf.js), or upload a photo. There's also a
   built-in sample menu to try.
4. **Read your results** — dishes are ranked 0–100 for *you*, with estimated
   nutrition, allergy warnings, condition-specific cautions, explanations, and
   healthier alternatives from the same menu.
5. **Save meals** you like — they appear under Saved meals; past scans live
   under Recent scans.

## How scoring works (simulated AI)

This build uses a deterministic, built-in nutrition engine instead of a paid AI API:

- **Energy needs** — Mifflin-St Jeor BMR × activity multiplier, adjusted for your
  goal, gives a daily target and a ~35% per-meal budget.
- **Nutrition estimates** — each dish is matched against a knowledge base of
  dish archetypes (burgers, curries, bowls, salads…) and modifiers
  (fried, creamy, grilled, loaded…) to estimate calories, protein, carbs, fat,
  fiber, sodium, and sugar.
- **Scoring** — calorie fit, protein for your goal, dietary preference
  violations, allergen detection, and condition rules (diabetes → sugar/carbs,
  hypertension → sodium, heart disease → fried/saturated fat, etc.).

### Upgrading to real AI

Swap the internals of `server/lib/nutrition-engine.js` (`analyzeMenu`) and the
image branch in `server/controllers/menu.controller.js` (`analyze`) with calls
to a vision/LLM API — the response shape is already what the frontend expects.

## Project structure

```
bitesense/
├── package.json              # root: npm run dev / build / start / migrate
├── server/
│   ├── package.json          # express, mongoose, cors, dotenv
│   ├── .env.example
│   ├── server.js             # Express app bootstrap, route mounting, error handling
│   ├── config/db.js          # Mongoose connection
│   ├── models/               # User, Analysis, Meal (Mongoose schemas)
│   ├── middleware/auth.js    # verifies bearer token, attaches req.user
│   ├── routes/                # one router per resource
│   ├── controllers/           # route handler logic
│   ├── lib/
│   │   ├── auth.js            # scrypt + HMAC tokens — unchanged from the original
│   │   ├── nutrition-engine.js# simulated AI — unchanged from the original
│   │   ├── menu-parser.js     # menu text → dishes — unchanged from the original
│   │   └── async-handler.js
│   └── scripts/
│       └── migrate-json-to-mongo.js   # one-time import of the old data/db.json
└── client/
    ├── package.json          # react, react-dom, vite
    ├── vite.config.js        # dev proxy: /api -> http://localhost:3000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx            # auth gate: Landing vs signed-in AppShell
        ├── api/client.js       # thin fetch wrapper
        ├── context/AuthContext.jsx
        ├── pages/              # Landing, AppShell, Scan, Results, Saved, Profile
        ├── components/         # AuthModal, StepCard, DishRow, EnergyStats, HistoryList
        ├── lib/pdfExtract.js   # client-side PDF text extraction (pdf.js via CDN)
        └── styles/styles.css   # ported unchanged — same basil/cream design system
```

## Notes

- Data is stored in MongoDB now, not `data/db.json`. See `MIGRATION.md` to
  import an existing `db.json` from the original build.
- Set `BS_SECRET`, `MONGODB_URI`, and `PORT` in `server/.env` for your environment.
- Image OCR is simulated (returns a representative sample menu); PDF and pasted
  text are parsed for real.
- Nutrition figures are AI estimates, not lab measurements — not medical advice.
