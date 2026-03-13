const mongoose = require('mongoose');

const pregnancyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  pregnancyMode: { type: Boolean, default: false },
  dueDate: { type: Date },
  lastMenstrualPeriod: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PregnancyProfile', pregnancyProfileSchema);

