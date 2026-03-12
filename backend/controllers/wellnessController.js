const WellnessLog = require('../models/WellnessLog');

exports.getWellnessLogs = async (req, res) => {
  const logs = await WellnessLog.find({ user: req.user.id }).sort('-date').limit(30);
  res.json(logs);
};

exports.addWellnessLog = async (req, res) => {
  const log = await WellnessLog.create({ ...req.body, user: req.user.id });
  res.status(201).json(log);
};
