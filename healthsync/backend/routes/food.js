const express = require('express');
const router = express.Router();
const { getFoodLogs, addFoodLog, deleteFoodLog, getWeeklyCalories } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFoodLogs);
router.get('/weekly', getWeeklyCalories);
router.post('/', addFoodLog);
router.delete('/:id', deleteFoodLog);

module.exports = router;
