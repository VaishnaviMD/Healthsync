const HealthReport = require('../models/HealthReport');
const User = require('../models/User');

function calculateBMI(height, weight) {
  if (!height || !weight) return null;
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function calculateDailyCalories(user) {
  if (!user.age || !user.height || !user.weight) return 2000;
  const bmr = user.gender === 'female'
    ? 655 + (9.6 * user.weight) + (1.8 * user.height) - (4.7 * user.age)
    : 66 + (13.7 * user.weight) + (5 * user.height) - (6.8 * user.age);
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const mult = multipliers[user.activityLevel] || 1.3;
  let cal = Math.round(bmr * mult);
  if (user.healthGoal === 'weight_loss') cal -= 500;
  if (user.healthGoal === 'weight_gain') cal += 500;
  return cal;
}

function generateHealthScore(user, survey) {
  let score = 50;
  // Activity (0-20)
  const activityScores = { sedentary: 5, light: 10, moderate: 15, active: 18, very_active: 20 };
  score += (activityScores[user.activityLevel] || 10) - 10;
  // Sleep (0-15)
  const sleep = user.sleepHours ?? survey?.sleepHours ?? 7;
  if (sleep >= 7 && sleep <= 9) score += 15;
  else if (sleep >= 6 || sleep <= 10) score += 8;
  else score += 2;
  // Hydration (0-10)
  const hydration = user.hydration ?? survey?.waterIntake ?? 6;
  if (hydration >= 8) score += 10;
  else if (hydration >= 6) score += 6;
  else score += 2;
  // Stress (0-10)
  const stressScores = { low: 10, medium: 5, high: 0 };
  score += stressScores[user.stressLevel] || 5;
  // Nutrition (0-5)
  if (user.dietType) score += 5;
  return Math.min(100, Math.max(0, Math.round(score)));
}

async function generateHealthReport(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const bmi = calculateBMI(user.height, user.weight);
  const bmiNum = bmi ? parseFloat(bmi) : null;
  const bmiCategory = bmiNum ? getBMICategory(bmiNum) : null;
  const dailyCalories = calculateDailyCalories(user);

  const healthScore = generateHealthScore(user, null);

  const hydrationRecommendation = `Aim for ${(user.weight ? Math.round(user.weight * 0.033) : 8)} glasses (${user.weight ? Math.round(user.weight * 0.033 * 0.25) : 2} liters) of water daily.`;

  let sleepHealth = 'Unknown';
  const sleep = user.sleepHours ?? 7;
  if (sleep >= 7 && sleep <= 9) sleepHealth = 'Good - You are getting adequate sleep.';
  else if (sleep < 6) sleepHealth = 'Needs improvement - Try to get 7-9 hours of sleep.';
  else sleepHealth = 'Moderate - Consider maintaining consistent sleep schedule.';

  const stressLevel = user.stressLevel ? (user.stressLevel.charAt(0).toUpperCase() + user.stressLevel.slice(1)) : 'Not specified';

  const fitnessLevel = user.activityLevel ? (user.activityLevel.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())) : 'Not specified';

  const riskIndicators = [];
  if (bmiNum && bmiNum >= 30) riskIndicators.push('High BMI - consider consulting a healthcare provider');
  if (bmiNum && bmiNum < 18.5) riskIndicators.push('Low BMI - ensure adequate nutrition');
  if (user.medicalConditions?.length) riskIndicators.push('Existing medical conditions - follow your care plan');
  if (user.allergies?.length) riskIndicators.push('Allergies on record - avoid known allergens');
  if (sleep < 6) riskIndicators.push('Insufficient sleep may affect health');
  if (user.stressLevel === 'high') riskIndicators.push('High stress - consider stress management techniques');
  if (riskIndicators.length === 0) riskIndicators.push('No major risk indicators identified');

  const recommendations = [];
  if (bmiNum && bmiNum >= 25) recommendations.push('Consider a balanced diet and regular exercise for healthy weight management');
  if (bmiNum && bmiNum < 18.5) recommendations.push('Focus on nutrient-dense foods to support healthy weight gain');
  if (sleep < 7) recommendations.push('Prioritize 7-9 hours of sleep for optimal health');
  if (user.stressLevel === 'high') recommendations.push('Practice relaxation techniques: meditation, deep breathing, or yoga');
  if ((user.hydration ?? 0) < 6) recommendations.push('Increase water intake throughout the day');
  if (!user.activityLevel || user.activityLevel === 'sedentary') recommendations.push('Add light physical activity - start with 15 min walks daily');
  if (recommendations.length === 0) recommendations.push('Maintain your current healthy habits');

  const dietTips = [];
  if (user.healthGoal === 'weight_loss') dietTips.push('Focus on portion control and high-fiber foods');
  if (user.healthGoal === 'weight_gain') dietTips.push('Include calorie-dense snacks between meals');
  dietTips.push('Eat a variety of fruits and vegetables daily');
  dietTips.push('Limit processed foods and added sugars');
  dietTips.push('Include lean protein in each meal');

  const exerciseSuggestions = [];
  if (user.activityLevel === 'sedentary') exerciseSuggestions.push('Start with 10-15 min walks, 3x per week');
  else if (user.activityLevel === 'light') exerciseSuggestions.push('Aim for 30 min moderate activity, 4-5 days/week');
  else exerciseSuggestions.push('Maintain your routine; consider adding strength training 2x/week');
  exerciseSuggestions.push('Include flexibility exercises (stretching, yoga)');
  exerciseSuggestions.push('Find activities you enjoy for long-term consistency');

  const summary = `${user.name}, your HealthSync score is ${healthScore}/100. ${bmiCategory ? `Your BMI (${bmi}) is ${bmiCategory}.` : ''} Daily calorie target: ${dailyCalories} kcal. ${recommendations[0] || 'Keep up the good work!'}`;

  const report = await HealthReport.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      healthScore,
      bmi: bmiNum,
      bmiCategory,
      dailyCalories,
      hydrationRecommendation,
      sleepHealth,
      stressLevel,
      fitnessLevel,
      riskIndicators,
      recommendations,
      dietTips,
      exerciseSuggestions,
      summary,
    },
    { upsert: true, new: true }
  );
  return report;
}

module.exports = { generateHealthReport, calculateBMI, getBMICategory, calculateDailyCalories };
