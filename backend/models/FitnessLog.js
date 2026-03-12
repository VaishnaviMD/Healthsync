const mongoose = require('mongoose');

const fitnessLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  steps: { type: Number, default: 0 },
  workoutType: { type: String },
  workoutDuration: { type: Number }, // minutes
  caloriesBurned: { type: Number },
  notes: { type: String },
}, { timestamps: true });

fitnessLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('FitnessLog', fitnessLogSchema);
