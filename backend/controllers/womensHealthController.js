const MenstrualCycle = require('../models/MenstrualCycle');
const PregnancyProfile = require('../models/PregnancyProfile');
const PregnancyLog = require('../models/PregnancyLog');

// Helpers
function buildCyclePredictions(cycle) {
  if (!cycle) return null;
  const lastPeriod = new Date(cycle.lastPeriodDate);
  const cycleLen = cycle.cycleLength || 28;
  const nextPeriod = new Date(lastPeriod); nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
  const ovulationDay = new Date(nextPeriod); ovulationDay.setDate(ovulationDay.getDate() - 14);
  const fertileStart = new Date(ovulationDay); fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulationDay); fertileEnd.setDate(fertileEnd.getDate() + 1);
  return { nextPeriod, ovulationDay, fertileStart, fertileEnd, cycleLength: cycleLen, lastPeriodDate: cycle.lastPeriodDate };
}

function calculatePregnancyFromDates({ dueDate, lastMenstrualPeriod }) {
  if (!dueDate && !lastMenstrualPeriod) return null;
  const today = new Date();
  let lmp = lastMenstrualPeriod ? new Date(lastMenstrualPeriod) : null;
  if (!lmp && dueDate) {
    // Naegele’s rule: LMP ≈ EDD - 280 days
    lmp = new Date(dueDate);
    lmp.setDate(lmp.getDate() - 280);
  }
  const edd = dueDate ? new Date(dueDate) : (() => {
    const d = new Date(lmp);
    d.setDate(d.getDate() + 280);
    return d;
  })();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysPregnant = Math.floor((today.getTime() - lmp.getTime()) / msPerDay);
  const week = Math.max(0, Math.floor(daysPregnant / 7));
  const month = Math.max(0, Math.floor(daysPregnant / 30));
  let trimester = 'First Trimester';
  if (week >= 27) trimester = 'Third Trimester';
  else if (week >= 13) trimester = 'Second Trimester';
  return { lmp, dueDate: edd, week, month, trimester };
}

// Cycle endpoints
exports.getCycles = async (req, res) => {
  const cycles = await MenstrualCycle.find({ user: req.user.id }).sort('-lastPeriodDate').limit(12);
  res.json(cycles);
};

exports.getPredictions = async (req, res) => {
  const cycle = await MenstrualCycle.findOne({ user: req.user.id }).sort('-lastPeriodDate');
  if (!cycle) return res.json({ predictions: null, message: 'Add your last period date to get predictions' });
  const preds = buildCyclePredictions(cycle);
  res.json({ predictions: preds, cycleLength: preds.cycleLength, lastPeriodDate: preds.lastPeriodDate });
};

exports.addCycle = async (req, res) => {
  const cycle = await MenstrualCycle.create({ ...req.body, user: req.user.id });
  const preds = buildCyclePredictions(cycle);
  res.status(201).json({ cycle, predictions: preds });
};

// Pregnancy endpoints
exports.getPregnancy = async (req, res) => {
  const profile = await PregnancyProfile.findOne({ user: req.user.id });
  if (!profile || !profile.pregnancyMode) {
    return res.json({ pregnancyMode: false, profile: null, derived: null });
  }
  const derived = calculatePregnancyFromDates({
    dueDate: profile.dueDate,
    lastMenstrualPeriod: profile.lastMenstrualPeriod,
  });
  res.json({ pregnancyMode: !!profile.pregnancyMode, profile, derived });
};

exports.savePregnancy = async (req, res) => {
  const { pregnancyMode, dueDate, lastMenstrualPeriod, notes } = req.body;
  const payload = {
    pregnancyMode: !!pregnancyMode,
    notes: notes || '',
  };
  if (dueDate) payload.dueDate = new Date(dueDate);
  if (lastMenstrualPeriod) payload.lastMenstrualPeriod = new Date(lastMenstrualPeriod);

  const profile = await PregnancyProfile.findOneAndUpdate(
    { user: req.user.id },
    { user: req.user.id, ...payload },
    { upsert: true, new: true }
  );

  const derived = calculatePregnancyFromDates({
    dueDate: profile.dueDate,
    lastMenstrualPeriod: profile.lastMenstrualPeriod,
  });
  res.status(201).json({ pregnancyMode: !!profile.pregnancyMode, profile, derived });
};

exports.getPregnancyLogs = async (req, res) => {
  const logs = await PregnancyLog.find({ user: req.user.id }).sort('-date').limit(60);
  res.json(logs);
};

exports.addPregnancyLog = async (req, res) => {
  const log = await PregnancyLog.create({ ...req.body, user: req.user.id });
  res.status(201).json(log);
};
