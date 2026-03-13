const express = require('express');
const router = express.Router();
const { getWellnessLogs, getTodaySummary, addWellnessLog } = require('../controllers/wellnessController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getWellnessLogs);
router.get('/today', getTodaySummary);
router.post('/', addWellnessLog);

module.exports = router;
