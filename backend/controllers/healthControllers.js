const { WellnessLog, Vaccination, MenstrualCycle } = require('../models/HealthModels');
const User = require('../models/User');

// Wellness
exports.getWellness = async (req, res) => {
  try {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const logs = await WellnessLog.find({ user: req.user.id, date: { $gte: weekAgo } }).sort('date');
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addWellness = async (req, res) => {
  try {
    const log = await WellnessLog.create({ ...req.body, user: req.user.id });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Vaccinations
exports.getVaccinations = async (req, res) => {
  try {
    const vacs = await Vaccination.find({ user: req.user.id }).sort('-dateTaken');
    res.json(vacs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addVaccination = async (req, res) => {
  try {
    const vac = await Vaccination.create({ ...req.body, user: req.user.id });
    res.status(201).json(vac);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteVaccination = async (req, res) => {
  try {
    await Vaccination.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Vaccination record removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Menstrual
exports.getMenstrual = async (req, res) => {
  try {
    const cycles = await MenstrualCycle.find({ user: req.user.id }).sort('-lastPeriodDate').limit(6);
    res.json(cycles);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addMenstrual = async (req, res) => {
  try {
    const cycle = await MenstrualCycle.create({ ...req.body, user: req.user.id });
    res.status(201).json(cycle);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, data, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
