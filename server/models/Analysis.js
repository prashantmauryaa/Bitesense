/**
 * Bite Sense — Analysis model.
 * One document per menu scan. `dishes`, `energy`, and `summary` are produced by
 * lib/nutrition-engine.js and stored as-is (their shape can evolve without a
 * schema migration since the engine, not the DB layer, owns that contract).
 */
const { Schema, model } = require('mongoose');

const AnalysisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantName: { type: String, default: 'Untitled menu' },
    source: { type: String, enum: ['text', 'pdf', 'image-demo', 'image'], default: 'text' },
    note: { type: String, default: null },
    summary: { type: String, default: '' },
    energy: { type: Schema.Types.Mixed, default: {} },
    dishes: { type: [Schema.Types.Mixed], default: [] },
    legacyId: { type: String, default: null, index: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
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

module.exports = model('Analysis', AnalysisSchema);
