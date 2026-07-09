/**
 * Bite Sense — one-time migration: data/db.json  →  MongoDB.
 *
 * The original zero-dependency build persisted everything to a flat file
 * shaped like:  { users: [], meals: [], analyses: [] }
 * with custom string ids (Date.now().toString(36) + random suffix).
 *
 * MongoDB uses ObjectIds for _id, so this script:
 *   1. Inserts each user, keeping their old id in `legacyId` and recording a
 *      map of oldId -> new ObjectId.
 *   2. Inserts each analysis/meal, rewriting their `userId` reference through
 *      that map (and keeping the old analysis/meal id in `legacyId` too).
 *   3. Skips (and reports) any analysis/meal whose owning user can't be found
 *      — rather than silently dropping the reference or crashing.
 *
 * Password hashes carry over unchanged: they use the same crypto.scrypt
 * format as before (see server/lib/auth.js), so existing users can log in
 * with their existing password after migration.
 *
 * Usage:
 *   node scripts/migrate-json-to-mongo.js [path/to/db.json]
 *   (defaults to ../../data/db.json relative to this file, i.e. the original
 *   project's data/db.json if you keep the same folder layout)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { connectDB, mongoose } = require('../config/db');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Meal = require('../models/Meal');

async function main() {
  const dbPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, '..', '..', 'data', 'db.json');

  if (!fs.existsSync(dbPath)) {
    console.error(`\n  ❌ Could not find ${dbPath}\n     Pass the path explicitly: node scripts/migrate-json-to-mongo.js /path/to/db.json\n`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const oldUsers = raw.users || [];
  const oldMeals = raw.meals || [];
  const oldAnalyses = raw.analyses || [];

  console.log(`\n  Read ${oldUsers.length} users, ${oldAnalyses.length} analyses, ${oldMeals.length} meals from ${dbPath}`);

  await connectDB();

  const idMap = new Map(); // old string id -> new ObjectId
  let usersCreated = 0, usersSkipped = 0;

  for (const u of oldUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      idMap.set(u.id, existing._id);
      usersSkipped++;
      continue;
    }
    const created = await User.create({
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash, // same scrypt format — logs in unchanged
      profile: u.profile || null,
      legacyId: u.id,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    });
    idMap.set(u.id, created._id);
    usersCreated++;
  }

  let analysesCreated = 0, analysesSkipped = 0;
  for (const a of oldAnalyses) {
    const newUserId = idMap.get(a.userId);
    if (!newUserId) { analysesSkipped++; continue; }
    await Analysis.create({
      userId: newUserId,
      restaurantName: a.restaurantName,
      source: a.source,
      note: a.note || null,
      summary: a.summary,
      energy: a.energy,
      dishes: a.dishes,
      legacyId: a.id,
      createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
    });
    analysesCreated++;
  }

  let mealsCreated = 0, mealsSkipped = 0;
  for (const m of oldMeals) {
    const newUserId = idMap.get(m.userId);
    if (!newUserId) { mealsSkipped++; continue; }
    await Meal.create({
      userId: newUserId,
      restaurantName: m.restaurantName || '',
      dish: m.dish,
      savedAt: m.savedAt ? new Date(m.savedAt) : new Date(),
      legacyId: m.id,
    });
    mealsCreated++;
  }

  console.log(`\n  ✅ Users:     ${usersCreated} created, ${usersSkipped} already existed (matched by email)`);
  console.log(`  ✅ Analyses:  ${analysesCreated} created, ${analysesSkipped} skipped (owner not found)`);
  console.log(`  ✅ Meals:     ${mealsCreated} created, ${mealsSkipped} skipped (owner not found)`);
  if (analysesSkipped || mealsSkipped) {
    console.log(`\n  ⚠️  Some records were skipped because their user wasn't found in db.json's users array.`);
    console.log(`     This can happen if db.json was hand-edited or is inconsistent. Skipped records are NOT`);
    console.log(`     retried automatically — re-run after fixing db.json if you need them.\n`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n  ❌ Migration failed:', err);
  process.exit(1);
});
