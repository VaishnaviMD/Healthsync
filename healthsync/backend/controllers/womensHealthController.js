const MenstrualCycle = require('../models/MenstrualCycle');

exports.getCycles = async (req, res) => {
  const cycles = await MenstrualCycle.find({ user: req.user.id }).sort('-lastPeriodDate').limit(12);
  res.json(cycles);
};

exports.addCycle = async (req, res) => {
  const cycle = await MenstrualCycle.create({ ...req.body, user: req.user.id });
  
  // Calculate predictions
  const lastPeriod = new Date(cycle.lastPeriodDate);
  const nextPeriod = new Date(lastPeriod); nextPeriod.setDate(nextPeriod.getDate() + cycle.cycleLength);
  const ovulationDay = new Date(nextPeriod); ovulationDay.setDate(ovulationDay.getDate() - 14);
  const fertileStart = new Date(ovulationDay); fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulationDay); fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  res.status(201).json({ cycle, predictions: { nextPeriod, ovulationDay, fertileStart, fertileEnd } });
};
