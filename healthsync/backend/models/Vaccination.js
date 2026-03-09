const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vaccineName: { type: String, required: true },
  dateTaken: { type: Date, required: true },
  nextDose: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
