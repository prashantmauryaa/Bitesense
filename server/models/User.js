/**
 * Bite Sense — User model.
 * `profile` mirrors the shape validated in controllers/profile.controller.js —
 * age, height/weight, activity level, goal, dietary preference, allergies, conditions.
 */
const { Schema, model } = require('mongoose');

const ProfileSchema = new Schema(
  {
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: true,
    },
    goal: {
      type: String,
      enum: ['lose_weight', 'maintain', 'gain_muscle', 'improve_health'],
      required: true,
    },
    dietaryPreference: {
      type: String,
      enum: ['none', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'low_carb'],
      required: true,
    },
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    profile: { type: ProfileSchema, default: null },
    // Preserves the original data/db.json id when imported by the migration script,
    // so historical Meals/Analyses documents (which reference this) still resolve.
    legacyId: { type: String, default: null, index: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.legacyId;
        return ret;
      },
    },
  }
);

module.exports = model('User', UserSchema);
