const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'weekly', 'as_needed'],
    default: 'once_daily'
  },
  times: [{ type: String }], // e.g. ["08:00", "14:00", "20:00"] - stored as HH:mm 24h
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  instructions: { type: String },
  foodRestrictions: { type: String },
  tabletsRemaining: { type: Number },
  lowStockThreshold: { type: Number, default: 5 },
  notes: { type: String },
  reminderEnabled: { type: Boolean, default: true },
}, { timestamps: true });

medicineSchema.pre('save', function (next) {
  if (!this.times || this.times.length === 0) {
    const defaults = { once_daily: ['08:00'], twice_daily: ['08:00', '20:00'], three_times_daily: ['08:00', '14:00', '20:00'], four_times_daily: ['08:00', '12:00', '16:00', '20:00'], weekly: ['08:00'], as_needed: [] };
    this.times = defaults[this.frequency] || ['08:00'];
  }
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);
