const FitnessLog = require('../models/FitnessLog');

exports.getLogs = async (req, res) => {
  const { start, end } = req.query;
  const query = { user: req.user.id };
  if (start) query.date = { $gte: new Date(start) };
  if (end) query.date = { ...query.date, $lte: new Date(end) };
  const logs = await FitnessLog.find(query).sort('-date').limit(30);
  res.json(logs);
};

exports.addLog = async (req, res) => {
  const log = await FitnessLog.create({ ...req.body, user: req.user.id });
  res.status(201).json(log);
};

exports.updateLog = async (req, res) => {
  const log = await FitnessLog.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, req.body, { new: true }
  );
  if (!log) return res.status(404).json({ message: 'Not found' });
  res.json(log);
};

exports.deleteLog = async (req, res) => {
  await FitnessLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};

exports.getStreak = async (req, res) => {
  const logs = await FitnessLog.find({ user: req.user.id })
    .sort('-date')
    .limit(365)
    .select('date steps workoutDuration')
    .lean();
  const activityByDate = new Map();
  logs.forEach(l => {
    const d = new Date(l.date).toDateString();
    const hasActivity = (l.steps || 0) >= 1000 || (l.workoutDuration || 0) > 0;
    if (!activityByDate.has(d)) activityByDate.set(d, hasActivity);
    else activityByDate.set(d, activityByDate.get(d) || hasActivity);
  });
  let streak = 0;
  const today = new Date().toDateString();
  let d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toDateString();
    if (activityByDate.get(key)) streak++;
    else if (key !== today) break;
    d.setDate(d.getDate() - 1);
  }
  res.json({ streak });
};
