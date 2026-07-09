# Migration notes: zero-dependency build → MERN

This documents the decisions made while porting Bite Sense from the original
`http` + JSON-file build to MongoDB/Express/React/Node, per the migration brief.

## Decisions

### Auth: kept the custom scrypt + HMAC scheme
`server/lib/auth.js` is copied **unchanged** — `crypto.scrypt` for password
hashing, HMAC-SHA256-signed tokens (JWT-shaped: `base64url(payload).signature`).
This was chosen over swapping to `bcrypt` + `jsonwebtoken` because:
- It's already implemented, tested, and working — no behavior changes needed.
- It keeps the dependency list smaller (no extra auth libraries).
- Existing password hashes migrate byte-for-byte (see below) — swapping to
  bcrypt would have forced every user to reset their password.

If you'd later prefer the more common `bcrypt` + `jsonwebtoken` combo, that's a
contained swap inside `server/lib/auth.js` and `server/middleware/auth.js` —
nothing else depends on the token format.

### Image OCR: still simulated
`server/controllers/menu.controller.js` still returns the hardcoded
`DEMO_MENU` from `menu-parser.js` for image uploads, exactly like the original.
No vision API was wired in — see the README's "Upgrading to real AI" section
if you want to do that next.

### State management: React Context only
Auth state (token/user) lives in `AuthContext`. Everything else (current
analysis, active tab, per-page loading/error state) is local `useState` in the
page/component that needs it. No Redux/Zustand — the app's state graph is
small enough that Context + prop-passing stays readable.

### Routing: tab-switching state, not react-router
The original was a single HTML page with `hidden` attributes toggling four
"tabs" (Scan / Results / Saved / Profile) inside one signed-in shell, plus a
separate signed-out landing page. That model was kept as-is in `AppShell.jsx`
(a `useState` for `activeTab`) rather than introducing URL-based routing, since:
- The four tabs were never meant to be independently bookmarkable/shareable.
- It's the smaller diff from the original UX.
- If deep-linking into a specific tab becomes a real requirement later,
  swapping `activeTab` state for `react-router-dom` routes is a contained
  change — each tab is already its own component.

### IDs: MongoDB ObjectIds, with `legacyId` preserved
The original build used custom string ids (`Date.now().toString(36) + random`).
Mongo's `_id` (ObjectId) replaces that as the primary key everywhere. Every
migrated document also gets a `legacyId` field holding its *original* id, purely
for traceability — it's stripped out of API responses (see each model's
`toJSON` transform) so the API contract's `id` field is unaffected; it's just a
new value shape (ObjectId hex string instead of the old custom string).

## Data migration

Run once, after setting `MONGODB_URI` in `server/.env`:

```bash
npm run migrate                          # expects ../data/db.json by default
# or, to point at a specific file:
node server/scripts/migrate-json-to-mongo.js /path/to/db.json
```

What it does:
- Inserts each user from `db.json`, keeping their **exact password hash** (so
  existing users can log in with their existing password after migration) and
  recording old-id → new-ObjectId in memory.
- Inserts each analysis/meal, rewriting `userId` through that map.
- **Skips and reports** (rather than silently dropping) any analysis/meal whose
  owning user can't be found — this shouldn't happen with an untouched
  `db.json`, but the script won't guess if the data is inconsistent.
- Matches existing users by email if run more than once, so it's safe to re-run.

## Known gaps / things worth double-checking

- **No live database was available in the environment this migration was
  built in**, so the server and migration script are verified by static
  analysis (`node --check` on every file) and a manual read-through against
  the original route handlers, but **not** by running requests against a real
  MongoDB instance. Before relying on this in production: run
  `npm run dev`, register a test account, complete a profile, scan the sample
  menu, save a meal, and confirm history/saved persist across a server
  restart — the same smoke test the original README implicitly assumed.
- **CORS** is configured via `CLIENT_ORIGIN` in `server/.env` — update it if
  you deploy the client to a different origin than the default dev setup.
- **Rate limiting / request throttling**: neither the original nor this build
  has any. Worth adding if this goes to production with real users.
