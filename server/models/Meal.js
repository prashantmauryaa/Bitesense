/**
 * Bite Sense — Meal model (a saved/bookmarked dish).
 * `dish` stores the scored dish object exactly as returned by /api/menu/analyze.
 */
const { Schema, model } = require('mongoose');

const MealSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantName: { type: String, default: '' },
    dish: { type: Schema.Types.Mixed, required: true },
    savedAt: { type: Date, default: Date.now },
    legacyId: { type: String, default: null, index: true },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.legacyId;
        return ret;
      },
    },
  }
);

module.exports = model('Meal', MealSchema);
