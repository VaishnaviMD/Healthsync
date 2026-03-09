import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';

const mealPlans: Record<string, any> = {
  weight_loss: {
    breakfast: ['Oatmeal with berries & chia seeds (320 kcal)', 'Greek yogurt with sliced fruit (200 kcal)', 'Boiled eggs with whole grain toast (280 kcal)'],
    lunch: ['Grilled chicken salad with olive oil dressing (380 kcal)', 'Lentil vegetable soup with bread (350 kcal)', 'Quinoa bowl with roasted vegetables (400 kcal)'],
    snack: ['Apple with almond butter (180 kcal)', 'Handful of mixed nuts (170 kcal)', 'Carrot sticks with hummus (120 kcal)'],
    dinner: ['Baked salmon with steamed broccoli (420 kcal)', 'Stir-fried tofu with vegetables (380 kcal)', 'Grilled turkey breast with sweet potato (450 kcal)'],
  },
  weight_gain: {
    breakfast: ['Oats with banana, milk & peanut butter (550 kcal)', 'Whole grain pancakes with honey & eggs (620 kcal)', 'Smoothie bowl with granola & mixed fruits (500 kcal)'],
    lunch: ['Brown rice with chicken curry & vegetables (700 kcal)', 'Pasta with ground beef & tomato sauce (680 kcal)', 'Burrito bowl with beans, rice & cheese (720 kcal)'],
    snack: ['Trail mix with dried fruits & nuts (350 kcal)', 'Whole milk smoothie with protein powder (400 kcal)', 'Peanut butter sandwich (350 kcal)'],
    dinner: ['Grilled steak with mashed potato & corn (750 kcal)', 'Salmon with quinoa & roasted veggies (680 kcal)', 'Chicken pasta with cheese sauce (720 kcal)'],
  },
  fitness: {
    breakfast: ['Protein oats with banana & whey (450 kcal)', 'Egg white omelette with whole grain toast (380 kcal)', 'Greek yogurt with granola & mixed berries (400 kcal)'],
    lunch: ['Grilled chicken with brown rice & broccoli (550 kcal)', 'Tuna wrap with avocado & salad (480 kcal)', 'Turkey & quinoa bowl with vegetables (520 kcal)'],
    snack: ['Protein bar or shake (250 kcal)', 'Cottage cheese with pineapple (200 kcal)', 'Rice cakes with peanut butter (220 kcal)'],
    dinner: ['Lean beef stir-fry with noodles (580 kcal)', 'Grilled fish with sweet potato & greens (500 kcal)', 'Chicken & vegetable curry with brown rice (560 kcal)'],
  },
  general_health: {
    breakfast: ['Whole grain cereal with milk & fruit (350 kcal)', 'Avocado toast with poached egg (380 kcal)', 'Smoothie with spinach, banana & almond milk (300 kcal)'],
    lunch: ['Mediterranean wrap with falafel & hummus (450 kcal)', 'Mixed vegetable soup with whole grain bread (380 kcal)', 'Caprese salad with grilled chicken (400 kcal)'],
    snack: ['Fresh fruit salad (120 kcal)', 'Dark chocolate & almonds (200 kcal)', 'Yogurt with honey (150 kcal)'],
    dinner: ['Grilled salmon with roasted vegetables (480 kcal)', 'Chicken & vegetable stir-fry with rice (520 kcal)', 'Lentil dahl with basmati rice (460 kcal)'],
  },
};

const mealColors = {
  breakfast: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: '🌅', label: 'text-amber-700 dark:text-amber-300' },
  lunch: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: '☀️', label: 'text-emerald-700 dark:text-emerald-300' },
  snack: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: '🍎', label: 'text-blue-700 dark:text-blue-300' },
  dinner: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: '🌙', label: 'text-purple-700 dark:text-purple-300' },
};

const DietPlanner = () => {
  const { user } = useAuth();
  const goal = user?.healthGoal || 'general_health';
  const plan = mealPlans[goal] || mealPlans.general_health;
  const goalLabel = goal.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <AppLayout title="Smart Diet Planner">
      <div className="max-w-3xl mx-auto space-y-6">
        <PageCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meal plan for your goal</p>
              <p className="text-xl font-bold text-foreground mt-1">{goalLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Recommended daily intake</p>
              <p className="text-2xl font-bold text-primary">{user?.dailyCalories?.toLocaleString() || '2,000'} kcal</p>
            </div>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(plan) as [string, string[]][]).map(([meal, options]) => {
            const colors = mealColors[meal as keyof typeof mealColors];
            return (
              <div key={meal} className={`rounded-xl border ${colors.bg} ${colors.border} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{colors.icon}</span>
                  <h3 className={`font-semibold capitalize ${colors.label}`}>{meal}</h3>
                </div>
                <ul className="space-y-2">
                  {options.map((opt, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-primary mt-1 shrink-0">•</span>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center">⚠️ Meal plans are general suggestions. Consult a registered dietitian for a personalized nutrition plan.</p>
      </div>
    </AppLayout>
  );
};

export default DietPlanner;
