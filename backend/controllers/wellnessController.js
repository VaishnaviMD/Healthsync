const WellnessLog = require('../models/WellnessLog');

exports.getWellnessLogs = async (req, res) => {
  const logs = await WellnessLog.find({ user: req.user.id }).sort('-date').limit(30);
  res.json(logs);
};

exports.getTodaySummary = async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const log = await WellnessLog.findOne({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
  res.json({
    waterIntake: log?.waterIntake ?? 0,
    energyLevel: log?.energyLevel ?? null,
    sleepHours: log?.sleepHours ?? null,
    mood: log?.mood ?? null,
  });
};

exports.addWellnessLog = async (req, res) => {
  const log = await WellnessLog.create({ ...req.body, user: req.user.id });
  res.status(201).json(log);
};
