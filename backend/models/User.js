const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', ''], default: '' },
  healthGoal: { type: String, enum: ['weight_loss', 'weight_gain', 'fitness', 'maintenance', 'general_health'], default: 'general_health' },
  medicalConditions: [{ type: String }],
  allergies: [{ type: String }],
  medications: [{ type: String }],
  dietType: { type: String, enum: ['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'other', ''], default: '' },
  sleepHours: { type: Number },
  stressLevel: { type: String, enum: ['low', 'medium', 'high', ''], default: '' },
  hydration: { type: Number }, // glasses per day
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  surveyCompleted: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
