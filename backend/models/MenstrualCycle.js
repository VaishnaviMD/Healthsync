const mongoose = require('mongoose');

const menstrualCycleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastPeriodDate: { type: Date, required: true },
  cycleLength: { type: Number, default: 28 },
  periodDuration: { type: Number, default: 5 },
  symptoms: [{ type: String }],
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MenstrualCycle', menstrualCycleSchema);
