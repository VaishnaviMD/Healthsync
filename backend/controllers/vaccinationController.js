const Vaccination = require('../models/Vaccination');

exports.getVaccinations = async (req, res) => {
  const vacs = await Vaccination.find({ user: req.user.id }).sort('-dateTaken');
  res.json(vacs);
};

exports.addVaccination = async (req, res) => {
  const vac = await Vaccination.create({ ...req.body, user: req.user.id });
  res.status(201).json(vac);
};

exports.updateVaccination = async (req, res) => {
  const vac = await Vaccination.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, req.body, { new: true }
  );
  if (!vac) return res.status(404).json({ message: 'Not found' });
  res.json(vac);
};

exports.deleteVaccination = async (req, res) => {
  await Vaccination.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};
