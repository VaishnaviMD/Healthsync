const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const mealPlans = {
  weight_loss: {
    breakfast: ["Oatmeal with berries (320 cal)", "Greek yogurt parfait (280 cal)", "Veggie egg white omelet (250 cal)", "Smoothie bowl (300 cal)"],
    lunch: ["Grilled chicken salad (380 cal)", "Lentil soup with whole grain bread (350 cal)", "Quinoa veggie bowl (400 cal)", "Tuna lettuce wraps (300 cal)"],
    snack: ["Apple with almond butter (200 cal)", "Carrot sticks with hummus (150 cal)", "Mixed nuts (180 cal)", "Celery with peanut butter (160 cal)"],
    dinner: ["Baked salmon with vegetables (450 cal)", "Stir-fried tofu with broccoli (380 cal)", "Turkey and vegetable soup (320 cal)", "Grilled chicken with sweet potato (420 cal)"]
  },
  weight_gain: {
    breakfast: ["Banana pancakes with nut butter (650 cal)", "Avocado toast with eggs (580 cal)", "Whole grain cereal with whole milk (520 cal)", "Breakfast burrito (700 cal)"],
    lunch: ["Brown rice with chicken and avocado (720 cal)", "Pasta with meat sauce (680 cal)", "Beef and vegetable stir-fry (640 cal)", "Chickpea and rice bowl (600 cal)"],
    snack: ["Trail mix with dried fruits (350 cal)", "Peanut butter banana smoothie (400 cal)", "Cheese and crackers (320 cal)", "Protein shake with milk (380 cal)"],
    dinner: ["Grilled steak with mashed potatoes (750 cal)", "Salmon with quinoa and vegetables (680 cal)", "Chicken pasta with cream sauce (700 cal)", "Beef stew with bread (720 cal)"]
  },
  fitness: {
    breakfast: ["Protein oatmeal with banana (450 cal)", "Egg scramble with vegetables (400 cal)", "Whole grain toast with eggs (380 cal)", "Protein smoothie (420 cal)"],
    lunch: ["Grilled chicken with brown rice (520 cal)", "Turkey sandwich on whole grain (480 cal)", "Tuna salad wrap (450 cal)", "Protein bowl with quinoa (500 cal)"],
    snack: ["Protein bar (220 cal)", "Greek yogurt with granola (260 cal)", "Hard boiled eggs (140 cal)", "Cottage cheese with fruit (200 cal)"],
    dinner: ["Grilled fish with roasted vegetables (480 cal)", "Chicken breast with sweet potato (520 cal)", "Lean beef stir-fry (500 cal)", "Turkey meatballs with zucchini noodles (440 cal)"]
  },
  general_health: {
    breakfast: ["Whole grain cereal with milk and fruit (380 cal)", "Toast with avocado and eggs (420 cal)", "Smoothie with spinach and fruit (320 cal)", "Oatmeal with honey and nuts (400 cal)"],
    lunch: ["Mediterranean salad with chickpeas (420 cal)", "Vegetable soup with bread (380 cal)", "Whole grain wrap with veggies (440 cal)", "Rice and bean bowl (460 cal)"],
    snack: ["Fresh fruit salad (150 cal)", "Handful of walnuts (185 cal)", "Yogurt with honey (200 cal)", "Veggie sticks with dip (130 cal)"],
    dinner: ["Baked chicken with roasted vegetables (480 cal)", "Fish tacos with cabbage slaw (520 cal)", "Vegetable curry with rice (460 cal)", "Lemon herb salmon (440 cal)"]
  }
};

router.get('/plan', protect, (req, res) => {
  const { goal = 'general_health' } = req.query;
  const plan = mealPlans[goal] || mealPlans.general_health;
  
  const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  res.json({
    goal,
    today: {
      breakfast: randomPick(plan.breakfast),
      lunch: randomPick(plan.lunch),
      snack: randomPick(plan.snack),
      dinner: randomPick(plan.dinner),
    },
    allOptions: plan
  });
});

module.exports = router;
