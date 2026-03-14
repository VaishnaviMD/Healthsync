const express = require('express');
const router = express.Router();
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getAdherence,
  getAdherenceChart,
  getReminders,
  markTaken,
  markSkipped,
  getMissedDoses,
  getHistory,
  getLowStock,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMedicines);
router.get('/adherence', getAdherence);
router.get('/adherence/chart', getAdherenceChart);
router.get('/reminders', getReminders);
router.get('/missed', getMissedDoses);
router.get('/history', getHistory);
router.get('/low-stock', getLowStock);
router.post('/', addMedicine);
router.post('/mark-taken', markTaken);
router.post('/mark-skipped', markSkipped);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
