const FoodLog = require('../models/FoodLog');
const { searchFoods, getNutritionForQuantity, parseIngredients, searchUSDA, analyzeImageWithVision } = require('../services/foodService');

const DAILY_GOALS = { protein: 50, carbs: 250, fats: 65, fiber: 25 };

exports.getFoodLogs = async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const logs = await FoodLog.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
  res.json(logs);
};

exports.getTodayLogs = async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const logs = await FoodLog.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
  const totals = logs.reduce((acc, l) => ({
    calories: acc.calories + (l.calories || 0),
    protein: acc.protein + (l.protein || 0),
    carbs: acc.carbs + (l.carbs || 0),
    fats: acc.fats + (l.fats || 0),
    fiber: acc.fiber + (l.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  res.json({ logs, totals });
};

exports.addFoodLog = async (req, res) => {
  const body = { ...req.body, user: req.user.id };
  if (body.fiber == null) body.fiber = 0;
  const log = await FoodLog.create(body);
  res.status(201).json(log);
};

exports.deleteFoodLog = async (req, res) => {
  await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
};

exports.getWeeklyCalories = async (req, res) => {
  const days = 7;
  const results = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - i);
    const next = new Date(day); next.setDate(next.getDate() + 1);
    const logs = await FoodLog.find({ user: req.user.id, date: { $gte: day, $lt: next } });
    const total = logs.reduce((s, l) => s + l.calories, 0);
    const protein = logs.reduce((s, l) => s + (l.protein || 0), 0);
    const carbs = logs.reduce((s, l) => s + (l.carbs || 0), 0);
    const fats = logs.reduce((s, l) => s + (l.fats || 0), 0);
    const fiber = logs.reduce((s, l) => s + (l.fiber || 0), 0);
    results.push({
      day: day.toLocaleDateString('en', { weekday: 'short' }),
      intake: total,
      goal: 2200,
      protein,
      carbs,
      fats,
      fiber,
    });
  }
  res.json(results);
};

exports.searchFood = async (req, res) => {
  const q = req.query.q || req.query.query || '';
  const local = searchFoods(q, 15);
  const usdaKey = process.env.USDA_FDC_API_KEY;
  let usda = null;
  if (usdaKey && q.length >= 2) {
    usda = await searchUSDA(q, usdaKey);
  }
  const combined = usda && usda.length > 0 ? [...usda.slice(0, 5), ...local.filter(l => !usda.some(u => u.name.toLowerCase() === l.name.toLowerCase()))] : local;
  res.json(combined.slice(0, 20));
};

exports.analyzeImage = async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: 'No image provided' });
  const openaiKey = process.env.OPENAI_API_KEY;
  const items = await analyzeImageWithVision(image, openaiKey);
  if (!items || items.length === 0) {
    return res.json({ items: [], total: null, message: 'Could not detect food. Try logging manually or ensure OPENAI_API_KEY is set.' });
  }
  const { total, items: parsedItems } = parseIngredients(items);
  res.json({
    items: parsedItems,
    total: { ...total, name: 'Detected meal' },
    message: parsedItems.length > 0 ? `${parsedItems.length} food(s) detected` : 'Could not match foods to database. Try logging manually.',
  });
};

exports.parseIngredients = async (req, res) => {
  const { ingredients } = req.body;
  const lines = Array.isArray(ingredients) ? ingredients : (typeof ingredients === 'string' ? ingredients.split(/\n/) : []);
  const result = parseIngredients(lines);
  res.json(result);
};

exports.getInsights = async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const logs = await FoodLog.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
  const totals = logs.reduce((acc, l) => ({
    calories: acc.calories + (l.calories || 0),
    protein: acc.protein + (l.protein || 0),
    carbs: acc.carbs + (l.carbs || 0),
    fats: acc.fats + (l.fats || 0),
    fiber: acc.fiber + (l.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

  const calorieGoal = 2200;
  const insights = [];

  if (totals.protein < DAILY_GOALS.protein * 0.5) {
    insights.push({ type: 'low_protein', message: 'Your protein intake is low today. Consider adding eggs, tofu, beans, or lean meat.', icon: 'protein' });
  }
  if (totals.fiber < DAILY_GOALS.fiber * 0.5) {
    insights.push({ type: 'low_fiber', message: 'Add more fiber-rich foods like vegetables, whole grains, and legumes.', icon: 'fiber' });
  }
  if (totals.carbs < DAILY_GOALS.carbs * 0.3 && totals.calories > 500) {
    insights.push({ type: 'low_carbs', message: 'Your carb intake is low. Consider adding rice, oats, or whole grain bread for energy.', icon: 'carbs' });
  }
  if (totals.fats < DAILY_GOALS.fats * 0.3 && totals.calories > 500) {
    insights.push({ type: 'low_fats', message: 'Healthy fats from avocado, nuts, or olive oil can support overall health.', icon: 'fats' });
  }
  if (totals.calories > calorieGoal * 1.2) {
    insights.push({ type: 'high_calories', message: "You're over your calorie goal. Consider lighter options for remaining meals.", icon: 'calories' });
  }
  if (totals.protein >= DAILY_GOALS.protein && totals.fiber >= DAILY_GOALS.fiber * 0.8) {
    insights.push({ type: 'balanced', message: 'Great job! Your nutrition looks well-balanced today.', icon: 'success' });
  }
  if (insights.length === 0 && totals.calories < 500) {
    insights.push({ type: 'log_more', message: 'Log your meals to get personalized nutrition insights.', icon: 'info' });
  }

  res.json({ insights, totals });
};
