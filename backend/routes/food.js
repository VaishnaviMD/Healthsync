const express = require('express');
const router = express.Router();
const { getFoodLogs, getTodayLogs, addFoodLog, deleteFoodLog, getWeeklyCalories } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFoodLogs);
router.get('/today', getTodayLogs);
router.get('/weekly', getWeeklyCalories);
router.post('/', addFoodLog);
router.delete('/:id', deleteFoodLog);

module.exports = router;
