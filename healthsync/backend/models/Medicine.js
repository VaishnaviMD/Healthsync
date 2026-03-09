const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String },
  status: { type: String, enum: ['taken','pending','missed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
