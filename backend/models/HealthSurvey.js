const mongoose = require('mongoose');

const healthSurveySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Personal
  age: { type: Number },
  gender: { type: String },
  height: { type: Number },
  weight: { type: Number },
  // Lifestyle
  activityLevel: { type: String },
  exerciseFrequency: { type: String },
  sleepHours: { type: Number },
  stressLevel: { type: String },
  // Nutrition
  dietType: { type: String },
  waterIntake: { type: Number },
  mealsPerDay: { type: Number },
  // Medical
  medicalConditions: [{ type: String }],
  allergies: [{ type: String }],
  medications: [{ type: String }],
  bloodPressure: { type: Boolean, default: false },
  diabetes: { type: Boolean, default: false },
  // Women's health (if female)
  menstrualCycleLength: { type: Number },
  periodDuration: { type: Number },
  lastPeriodDate: { type: Date },
  pregnancyStatus: { type: String },
  // Fitness goals
  fitnessGoal: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HealthSurvey', healthSurveySchema);
