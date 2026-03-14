const mongoose = require('mongoose');

const medicineTakenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  status: { type: String, enum: ['taken', 'missed', 'skipped', 'pending'], default: 'pending' },
  takenAt: { type: Date },
  skippedAt: { type: Date },
  markedLate: { type: Boolean, default: false },
}, { timestamps: true });

medicineTakenSchema.index({ user: 1, medicine: 1, scheduledDate: 1, scheduledTime: 1 }, { unique: true });

module.exports = mongoose.model('MedicineTaken', medicineTakenSchema);
