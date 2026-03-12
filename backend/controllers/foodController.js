const FoodLog = require('../models/FoodLog');

exports.getFoodLogs = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const logs = await FoodLog.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
  res.json(logs);
};

exports.getTodayLogs = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const logs = await FoodLog.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
  const totals = logs.reduce((acc, l) => ({
    calories: acc.calories + (l.calories || 0),
    protein: acc.protein + (l.protein || 0),
    carbs: acc.carbs + (l.carbs || 0),
    fats: acc.fats + (l.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  res.json({ logs, totals });
};

exports.addFoodLog = async (req, res) => {
  const log = await FoodLog.create({ ...req.body, user: req.user.id });
  res.status(201).json(log);
};

exports.deleteFoodLog = async (req, res) => {
  await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};

exports.getWeeklyCalories = async (req, res) => {
  const days = 7;
  const results = [];
  for (let i = days-1; i >= 0; i--) {
    const day = new Date(); day.setHours(0,0,0,0); day.setDate(day.getDate()-i);
    const next = new Date(day); next.setDate(next.getDate()+1);
    const logs = await FoodLog.find({ user: req.user.id, date: { $gte: day, $lt: next } });
    const total = logs.reduce((s,l) => s+l.calories, 0);
    results.push({ day: day.toLocaleDateString('en', { weekday: 'short' }), intake: total, goal: 2200 });
  }
  res.json(results);
};
