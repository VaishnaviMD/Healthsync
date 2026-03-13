const express = require('express');
const router = express.Router();
const {
  getCycles,
  addCycle,
  getPredictions,
  getPregnancy,
  savePregnancy,
  getPregnancyLogs,
  addPregnancyLog,
} = require('../controllers/womensHealthController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Menstrual cycle
router.get('/', getCycles);
router.get('/predictions', getPredictions);
router.post('/', addCycle);

// Pregnancy tracking
router.get('/pregnancy', getPregnancy);
router.post('/pregnancy', savePregnancy);
router.get('/pregnancy/logs', getPregnancyLogs);
router.post('/pregnancy/logs', addPregnancyLog);

module.exports = router;
