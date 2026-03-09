const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  const medicines = await Medicine.find({ user: req.user.id }).sort('-createdAt');
  res.json(medicines);
};

exports.addMedicine = async (req, res) => {
  const medicine = await Medicine.create({ ...req.body, user: req.user.id });
  res.status(201).json(medicine);
};

exports.updateMedicine = async (req, res) => {
  const medicine = await Medicine.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, req.body, { new: true }
  );
  if (!medicine) return res.status(404).json({ message: 'Not found' });
  res.json(medicine);
};

exports.deleteMedicine = async (req, res) => {
  await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};
