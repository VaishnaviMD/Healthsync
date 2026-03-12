const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

function toUserObject(user) {
  const u = (typeof user.toObject === 'function') ? user.toObject() : user;
  const { password, ...rest } = u;
  const bmi = user.height && user.weight ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1) : null;
  let dailyCalories = 2000;
  if (user.age && user.height && user.weight) {
    const bmr = user.gender === 'female'
      ? 655 + (9.6 * user.weight) + (1.8 * user.height) - (4.7 * user.age)
      : 66 + (13.7 * user.weight) + (5 * user.height) - (6.8 * user.age);
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const mult = multipliers[user.activityLevel] || 1.3;
    dailyCalories = Math.round(bmr * mult);
    if (user.healthGoal === 'weight_loss') dailyCalories -= 500;
    if (user.healthGoal === 'weight_gain') dailyCalories += 500;
  }
  return { ...rest, id: rest._id, bmi: bmi ? parseFloat(bmi) : null, dailyCalories };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, age, height, weight, healthGoal } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, age, height, weight, healthGoal });
    const userObj = toUserObject(user);
    res.status(201).json({ user: userObj, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    const userObj = toUserObject(user);
    res.json({ user: userObj, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(toUserObject(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(toUserObject(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
