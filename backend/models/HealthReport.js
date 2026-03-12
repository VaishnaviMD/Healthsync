const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  healthScore: { type: Number, required: true },
  bmi: { type: Number },
  bmiCategory: { type: String },
  dailyCalories: { type: Number },
  hydrationRecommendation: { type: String },
  sleepHealth: { type: String },
  stressLevel: { type: String },
  fitnessLevel: { type: String },
  riskIndicators: [{ type: String }],
  recommendations: [{ type: String }],
  dietTips: [{ type: String }],
  exerciseSuggestions: [{ type: String }],
  summary: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HealthReport', healthReportSchema);
