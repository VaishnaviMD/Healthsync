const express = require('express');
const router = express.Router();
const { getWellnessLogs, addWellnessLog } = require('../controllers/wellnessController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getWellnessLogs);
router.post('/', addWellnessLog);

module.exports = router;
