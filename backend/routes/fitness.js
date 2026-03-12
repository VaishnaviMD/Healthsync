const express = require('express');
const router = express.Router();
const { getLogs, addLog, updateLog, deleteLog, getStreak } = require('../controllers/fitnessController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getLogs);
router.get('/streak', getStreak);
router.post('/', addLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

module.exports = router;
