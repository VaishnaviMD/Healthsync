const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  medicineName: { type: String }, // alias for name
  dosage: { type: String, required: true },
  frequency: { type: String, default: 'daily' }, // daily, twice_daily, weekly, etc.
  time: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  instructions: { type: String },
  foodRestrictions: { type: String },
  duration: { type: String },
  status: { type: String, enum: ['taken', 'pending', 'missed', 'skipped'], default: 'pending' },
  takenDate: { type: Date }, // last date when marked as taken (for daily adherence)
  notes: { type: String },
}, { timestamps: true });

medicineSchema.pre('save', function (next) {
  if (this.medicineName && !this.name) this.name = this.medicineName;
  if (this.name && !this.medicineName) this.medicineName = this.name;
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);
