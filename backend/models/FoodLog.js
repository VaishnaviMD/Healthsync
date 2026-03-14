const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  meal: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Snack', 'Other'], default: 'Other' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('FoodLog', foodLogSchema);
