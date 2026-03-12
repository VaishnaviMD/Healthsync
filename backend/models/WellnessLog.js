const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  energyLevel: { type: String, enum: ['low','medium','high'], required: true },
  waterIntake: { type: Number, default: 0 }, // liters
  sleepHours: { type: Number, default: 0 },
  mood: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('WellnessLog', wellnessSchema);
