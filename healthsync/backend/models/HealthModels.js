const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  energyLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  waterIntake: Number,
  sleepHours: Number,
  mood: String,
  notes: String,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const vaccinationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vaccineName: { type: String, required: true },
  dateTaken: Date,
  nextDose: Date,
  notes: String,
}, { timestamps: true });

const menstrualSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastPeriodDate: { type: Date, required: true },
  cycleLength: { type: Number, default: 28 },
  periodDuration: { type: Number, default: 5 },
  symptoms: [String],
  notes: String,
}, { timestamps: true });

module.exports = {
  WellnessLog: mongoose.model('WellnessLog', wellnessSchema),
  Vaccination: mongoose.model('Vaccination', vaccinationSchema),
  MenstrualCycle: mongoose.model('MenstrualCycle', menstrualSchema),
};
