const HealthReport = require('../models/HealthReport');

exports.getReport = async (req, res) => {
  try {
    const report = await HealthReport.findOne({ user: req.user.id }).sort('-createdAt');
    if (!report) return res.status(404).json({ message: 'No health report found. Complete the health survey first.' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
