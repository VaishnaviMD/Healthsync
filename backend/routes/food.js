const express = require('express');
const router = express.Router();
const {
  getFoodLogs,
  getTodayLogs,
  addFoodLog,
  deleteFoodLog,
  getWeeklyCalories,
  searchFood,
  analyzeImage,
  parseIngredients,
  getInsights,
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFoodLogs);
router.get('/today', getTodayLogs);
router.get('/weekly', getWeeklyCalories);
router.get('/search', searchFood);
router.get('/insights', getInsights);
router.post('/', addFoodLog);
router.post('/analyze-image', analyzeImage);
router.post('/parse-ingredients', parseIngredients);
router.delete('/:id', deleteFoodLog);

module.exports = router;
