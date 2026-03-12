const FoodLog = require('../models/FoodLog');

const todayRange = () => {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return { $gte: start, $lte: end };
};

exports.getTodayLogs = async (req, res) => {
  try {
    const logs = await FoodLog.find({ user: req.user.id, date: todayRange() });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getWeeklyLogs = async (req, res) => {
  try {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const logs = await FoodLog.find({ user: req.user.id, date: { $gte: weekAgo } }).sort('date');
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addLog = async (req, res) => {
  try {
    const log = await FoodLog.create({ ...req.body, user: req.user.id });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteLog = async (req, res) => {
  try {
    await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Log removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
