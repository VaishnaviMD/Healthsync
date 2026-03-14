const Medicine = require('../models/Medicine');
const MedicineTaken = require('../models/MedicineTaken');

const LOW_STOCK_DEFAULT = 5;

// Parse "8:00 AM" or "08:00" to "08:00" / "20:00"
function parseTimeTo24(t) {
  if (!t || typeof t !== 'string') return '08:00';
  const s = t.trim().toUpperCase();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i) || s.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (!m) return t.length <= 5 ? t : '08:00';
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = (m[3] || m[2]).toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Get times array from medicine (supports legacy single "time" field)
function getTimes(med) {
  if (med.times && med.times.length > 0) return med.times.map(parseTimeTo24);
  if (med.time) return [parseTimeTo24(med.time)];
  const defaults = { once_daily: ['08:00'], twice_daily: ['08:00', '20:00'], three_times_daily: ['08:00', '14:00', '20:00'], four_times_daily: ['08:00', '12:00', '16:00', '20:00'], weekly: ['08:00'] };
  return defaults[med.frequency] || ['08:00'];
}

// Get scheduled doses for a date (array of { time, displayTime })
function getScheduledSlotsForDate(med, date) {
  const times = getTimes(med);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  if (med.frequency === 'weekly') {
    const start = med.startDate ? new Date(med.startDate).getDay() : 0;
    if (dayOfWeek !== start) return [];
  }
  if (med.frequency === 'as_needed') return [];
  return times.map(t => ({ time: t, displayTime: formatDisplayTime(t) }));
}

function formatDisplayTime(t) {
  const [h, m] = (t || '08:00').split(':').map(Number);
  const am = h < 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

// Check if date is within medicine active period
function isActiveOnDate(med, date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (med.startDate && new Date(med.startDate) > d) return false;
  if (med.endDate) {
    const end = new Date(med.endDate);
    end.setHours(23, 59, 59, 999);
    if (end < d) return false;
  }
  return true;
}

// Count scheduled doses in date range
function countScheduledInRange(medicines, startDate, endDate) {
  let total = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  for (const med of medicines) {
    if (!isActiveOnDate(med, start)) continue;
    const times = getTimes(med);
    if (med.frequency === 'as_needed' || times.length === 0) continue;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const slots = getScheduledSlotsForDate(med, d);
      total += slots.length;
    }
  }
  return total;
}

exports.getMedicines = async (req, res) => {
  const medicines = await Medicine.find({ user: req.user.id }).sort('-createdAt').lean();
  const result = medicines.map(m => ({
    ...m,
    times: getTimes(m),
    tabletsRemaining: m.tabletsRemaining ?? null,
    lowStockThreshold: m.lowStockThreshold ?? LOW_STOCK_DEFAULT,
  }));
  res.json(result);
};

exports.addMedicine = async (req, res) => {
  const body = { ...req.body, user: req.user.id };
  if (body.medicineName && !body.name) body.name = body.medicineName;
  if (body.time && (!body.times || body.times.length === 0)) {
    body.times = [parseTimeTo24(body.time)];
  }
  if (body.frequency && !body.times?.length) {
    const defaults = { once_daily: [body.time ? parseTimeTo24(body.time) : '08:00'], twice_daily: ['08:00', '20:00'], three_times_daily: ['08:00', '14:00', '20:00'], four_times_daily: ['08:00', '12:00', '16:00', '20:00'] };
    body.times = defaults[body.frequency] || [body.time ? parseTimeTo24(body.time) : '08:00'];
  }
  if (typeof body.tabletsRemaining === 'string') body.tabletsRemaining = parseInt(body.tabletsRemaining, 10) || null;
  if (typeof body.lowStockThreshold === 'string') body.lowStockThreshold = parseInt(body.lowStockThreshold, 10) || LOW_STOCK_DEFAULT;
  const medicine = await Medicine.create(body);
  res.status(201).json(medicine);
};

exports.updateMedicine = async (req, res) => {
  const body = { ...req.body };
  delete body.user;
  if (body.time && (!body.times || body.times.length === 0)) body.times = [parseTimeTo24(body.time)];
  if (typeof body.tabletsRemaining === 'string') body.tabletsRemaining = body.tabletsRemaining === '' ? null : parseInt(body.tabletsRemaining, 10);
  const medicine = await Medicine.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    body,
    { new: true }
  );
  if (!medicine) return res.status(404).json({ message: 'Not found' });
  res.json(medicine);
};

exports.deleteMedicine = async (req, res) => {
  await MedicineTaken.deleteMany({ medicine: req.params.id });
  await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};

exports.getReminders = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const medicines = await Medicine.find({ user: req.user.id, reminderEnabled: { $ne: false } }).lean();
  const takenRecords = await MedicineTaken.find({
    user: req.user.id,
    scheduledDate: { $in: [today, tomorrow] },
  }).lean();
  const takenMap = {};
  takenRecords.forEach(r => {
    const key = `${r.medicine}-${r.scheduledDate.toISOString().slice(0, 10)}-${r.scheduledTime}`;
    takenMap[key] = r.status;
  });
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const reminders = [];
  for (const med of medicines) {
    if (!isActiveOnDate(med, today)) continue;
    const times = getTimes(med);
    const medId = med._id.toString();
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      const slotMinutes = h * 60 + m;
      const slotDate = new Date(today);
      const key = `${medId}-${slotDate.toISOString().slice(0, 10)}-${t}`;
      const status = takenMap[key];
      reminders.push({
        medicineId: med._id,
        medicineName: med.name,
        dosage: med.dosage,
        scheduledDate: slotDate,
        scheduledTime: t,
        displayTime: formatDisplayTime(t),
        status: status || 'pending',
        isPast: slotMinutes < currentMinutes,
        isToday: true,
      });
    }
  }
  for (const med of medicines) {
    if (!isActiveOnDate(med, tomorrow)) continue;
    const times = getTimes(med);
    const medId = med._id.toString();
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      const slotDate = new Date(tomorrow);
      const key = `${medId}-${slotDate.toISOString().slice(0, 10)}-${t}`;
      const status = takenMap[key];
      reminders.push({
        medicineId: med._id,
        medicineName: med.name,
        dosage: med.dosage,
        scheduledDate: slotDate,
        scheduledTime: t,
        displayTime: formatDisplayTime(t),
        status: status || 'pending',
        isPast: false,
        isToday: false,
      });
    }
  }
  reminders.sort((a, b) => {
    const d = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    if (d !== 0) return d;
    return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
  });
  res.json(reminders);
};

exports.markTaken = async (req, res) => {
  const { medicineId, scheduledDate, scheduledTime } = req.body;
  const userId = req.user.id;
  const med = await Medicine.findOne({ _id: medicineId, user: userId });
  if (!med) return res.status(404).json({ message: 'Medicine not found' });
  const d = new Date(scheduledDate);
  d.setHours(0, 0, 0, 0);
  const existing = await MedicineTaken.findOne({
    user: userId,
    medicine: medicineId,
    scheduledDate: d,
    scheduledTime: scheduledTime || getTimes(med)[0],
  });
  const payload = {
    user: userId,
    medicine: medicineId,
    scheduledDate: d,
    scheduledTime: scheduledTime || getTimes(med)[0],
    status: 'taken',
    takenAt: new Date(),
    markedLate: !!req.body.markedLate,
  };
  let record;
  if (existing) {
    record = await MedicineTaken.findOneAndUpdate(
      { _id: existing._id },
      { status: 'taken', takenAt: new Date(), markedLate: payload.markedLate },
      { new: true }
    );
  } else {
    record = await MedicineTaken.create(payload);
  }
  if (med.tabletsRemaining != null && med.tabletsRemaining > 0) {
    await Medicine.findOneAndUpdate(
      { _id: medicineId, tabletsRemaining: { $gt: 0 } },
      { $inc: { tabletsRemaining: -1 } }
    );
  }
  res.json(record);
};

exports.markSkipped = async (req, res) => {
  const { medicineId, scheduledDate, scheduledTime } = req.body;
  const userId = req.user.id;
  const med = await Medicine.findOne({ _id: medicineId, user: userId });
  if (!med) return res.status(404).json({ message: 'Medicine not found' });
  const d = new Date(scheduledDate);
  d.setHours(0, 0, 0, 0);
  const time = scheduledTime || getTimes(med)[0];
  const existing = await MedicineTaken.findOne({ user: userId, medicine: medicineId, scheduledDate: d, scheduledTime: time });
  const payload = { user: userId, medicine: medicineId, scheduledDate: d, scheduledTime: time, status: 'skipped', skippedAt: new Date() };
  const record = existing
    ? await MedicineTaken.findOneAndUpdate({ _id: existing._id }, { status: 'skipped', skippedAt: new Date() }, { new: true })
    : await MedicineTaken.create(payload);
  res.json(record);
};

exports.getAdherence = async (req, res) => {
  const medicines = await Medicine.find({ user: req.user.id });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = countScheduledInRange(medicines, today, today);
  const taken = await MedicineTaken.countDocuments({
    user: req.user.id,
    status: 'taken',
    scheduledDate: today,
  });
  const pct = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0;
  res.json({ taken, total: scheduled, adherencePercent: pct });
};

exports.getAdherenceChart = async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const medicines = await Medicine.find({ user: req.user.id });
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  const data = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const scheduled = countScheduledInRange(medicines, dayStart, dayEnd);
    const taken = await MedicineTaken.countDocuments({
      user: req.user.id,
      status: 'taken',
      scheduledDate: dayStart,
    });
    const pct = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0;
    data.push({
      date: dayStart.toISOString().slice(0, 10),
      label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      taken,
      scheduled,
      adherencePercent: pct,
    });
  }
  res.json(data);
};

exports.getMissedDoses = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const medicines = await Medicine.find({ user: req.user.id }).lean();
  const takenRecords = await MedicineTaken.find({
    user: req.user.id,
    scheduledDate: today,
  }).lean();
  const takenMap = {};
  takenRecords.forEach(r => {
    const key = `${r.medicine}-${r.scheduledTime}`;
    takenMap[key] = r.status;
  });
  const missed = [];
  for (const med of medicines) {
    if (!isActiveOnDate(med, today)) continue;
    const times = getTimes(med);
    const medId = med._id.toString();
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      const slotMinutes = h * 60 + m;
      const key = `${medId}-${t}`;
      const status = takenMap[key];
      if (!status && slotMinutes < currentMinutes - 15) {
        missed.push({
          medicineId: med._id,
          medicineName: med.name,
          dosage: med.dosage,
          scheduledTime: t,
          displayTime: formatDisplayTime(t),
        });
      }
    }
  }
  res.json(missed);
};

exports.getHistory = async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const records = await MedicineTaken.find({
    user: req.user.id,
    scheduledDate: date,
  }).populate('medicine', 'name dosage').lean();
  const list = records.map(r => ({
    medicineName: r.medicine?.name || 'Unknown',
    dosage: r.medicine?.dosage || '',
    status: r.status,
    displayTime: formatDisplayTime(r.scheduledTime),
  }));
  res.json({ date: date.toISOString().slice(0, 10), entries: list });
};

exports.getLowStock = async (req, res) => {
  const medicines = await Medicine.find({
    user: req.user.id,
    tabletsRemaining: { $ne: null, $exists: true },
  }).lean();
  const lowStock = medicines.filter(m => {
    const rem = m.tabletsRemaining;
    const thresh = m.lowStockThreshold ?? LOW_STOCK_DEFAULT;
    return rem != null && rem <= thresh;
  });
  res.json(lowStock);
};
