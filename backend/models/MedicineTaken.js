const mongoose = require('mongoose');

const medicineTakenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String },
  takenAt: { type: Date },
  status: { type: String, enum: ['taken', 'missed', 'skipped'], default: 'taken' },
}, { timestamps: true });

module.exports = mongoose.model('MedicineTaken', medicineTakenSchema);
