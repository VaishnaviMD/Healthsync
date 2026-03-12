const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  const medicines = await Medicine.find({ user: req.user.id }).sort('-createdAt').lean();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const result = medicines.map(m => {
    const takenToday = m.takenDate && new Date(m.takenDate) >= today && new Date(m.takenDate) < tomorrow;
    return { ...m, status: takenToday ? 'taken' : (m.status === 'taken' ? 'pending' : m.status) };
  });
  res.json(result);
};

exports.addMedicine = async (req, res) => {
  const body = { ...req.body, user: req.user.id };
  if (body.medicineName && !body.name) body.name = body.medicineName;
  if (body.name && !body.medicineName) body.medicineName = body.name;
  const medicine = await Medicine.create(body);
  res.status(201).json(medicine);
};

exports.getAdherence = async (req, res) => {
  const medicines = await Medicine.find({ user: req.user.id });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const taken = medicines.filter(m => {
    const td = m.takenDate ? new Date(m.takenDate) : null;
    return td && td >= today && td < tomorrow;
  }).length;
  const total = medicines.length;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
  res.json({ taken, total, adherencePercent: pct });
};

exports.updateMedicine = async (req, res) => {
  const body = { ...req.body };
  if (body.status === 'taken') body.takenDate = new Date();
  else if (body.status === 'pending' || body.status === 'missed') body.takenDate = null;
  const medicine = await Medicine.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, body, { new: true }
  );
  if (!medicine) return res.status(404).json({ message: 'Not found' });
  res.json(medicine);
};

exports.deleteMedicine = async (req, res) => {
  await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};
