const MenstrualCycle = require('../models/MenstrualCycle');

exports.getCycle = async (req, res) => {
  try {
    const cycle = await MenstrualCycle.findOne({ user: req.user.id }).sort('-createdAt');
    if (!cycle) return res.json(null);
    const lpd = new Date(cycle.lastPeriodDate);
    const nextPeriod = new Date(lpd); nextPeriod.setDate(lpd.getDate() + cycle.cycleLength);
    const ovulation = new Date(lpd); ovulation.setDate(lpd.getDate() + cycle.cycleLength - 14);
    const fertileStart = new Date(ovulation); fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation); fertileEnd.setDate(ovulation.getDate() + 1);
    res.json({ ...cycle.toObject(), predictions: { nextPeriod, ovulation, fertileStart, fertileEnd } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.saveCycle = async (req, res) => {
  try {
    const existing = await MenstrualCycle.findOne({ user: req.user.id });
    let cycle;
    if (existing) {
      cycle = await MenstrualCycle.findByIdAndUpdate(existing._id, req.body, { new: true });
    } else {
      cycle = await MenstrualCycle.create({ ...req.body, user: req.user.id });
    }
    res.json(cycle);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
