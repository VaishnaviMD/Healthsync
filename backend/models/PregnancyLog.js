const mongoose = require('mongoose');

const pregnancyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number }, // kg
  systolic: { type: Number },
  diastolic: { type: Number },
  doctorVisit: { type: Boolean, default: false },
  supplements: { type: String },
  mood: { type: String }, // happy, stressed, anxious, tired, energetic
  symptoms: [{ type: String }],
}, { timestamps: true });

pregnancyLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('PregnancyLog', pregnancyLogSchema);

