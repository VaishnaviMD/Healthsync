import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';

const mealPlans: Record<string, any> = {
  weight_loss: {
    breakfast: [
      { name: 'Oatmeal with berries & chia seeds', calories: 320, protein: 10, carbs: 52, fats: 8 },
      { name: 'Greek yogurt with sliced fruit', calories: 200, protein: 15, carbs: 28, fats: 4 },
      { name: 'Boiled eggs with whole grain toast', calories: 280, protein: 14, carbs: 32, fats: 10 },
    ],
    lunch: [
      { name: 'Grilled chicken salad with olive oil dressing', calories: 380, protein: 35, carbs: 12, fats: 22 },
      { name: 'Lentil vegetable soup with bread', calories: 350, protein: 18, carbs: 55, fats: 6 },
      { name: 'Quinoa bowl with roasted vegetables', calories: 400, protein: 14, carbs: 58, fats: 12 },
    ],
    snack: [
      { name: 'Apple with almond butter', calories: 180, protein: 4, carbs: 22, fats: 10 },
      { name: 'Handful of mixed nuts', calories: 170, protein: 5, carbs: 6, fats: 15 },
      { name: 'Carrot sticks with hummus', calories: 120, protein: 4, carbs: 14, fats: 6 },
    ],
    dinner: [
      { name: 'Baked salmon with steamed broccoli', calories: 420, protein: 38, carbs: 12, fats: 24 },
      { name: 'Stir-fried tofu with vegetables', calories: 380, protein: 22, carbs: 28, fats: 18 },
      { name: 'Grilled turkey breast with sweet potato', calories: 450, protein: 42, carbs: 42, fats: 12 },
    ],
  },
  weight_gain: {
    breakfast: [
      { name: 'Oats with banana, milk & peanut butter', calories: 550, protein: 18, carbs: 68, fats: 22 },
      { name: 'Whole grain pancakes with honey & eggs', calories: 620, protein: 22, carbs: 82, fats: 20 },
      { name: 'Smoothie bowl with granola & mixed fruits', calories: 500, protein: 12, carbs: 78, fats: 14 },
    ],
    lunch: [
      { name: 'Brown rice with chicken curry & vegetables', calories: 700, protein: 45, carbs: 72, fats: 22 },
      { name: 'Pasta with ground beef & tomato sauce', calories: 680, protein: 38, carbs: 75, fats: 24 },
      { name: 'Burrito bowl with beans, rice & cheese', calories: 720, protein: 32, carbs: 82, fats: 26 },
    ],
    snack: [
      { name: 'Trail mix with dried fruits & nuts', calories: 350, protein: 10, carbs: 38, fats: 18 },
      { name: 'Whole milk smoothie with protein powder', calories: 400, protein: 32, carbs: 42, fats: 10 },
      { name: 'Peanut butter sandwich', calories: 350, protein: 14, carbs: 38, fats: 16 },
    ],
    dinner: [
      { name: 'Grilled steak with mashed potato & corn', calories: 750, protein: 52, carbs: 58, fats: 38 },
      { name: 'Salmon with quinoa & roasted veggies', calories: 680, protein: 42, carbs: 55, fats: 32 },
      { name: 'Chicken pasta with cheese sauce', calories: 720, protein: 48, carbs: 68, fats: 28 },
    ],
  },
  fitness: {
    breakfast: [
      { name: 'Protein oats with banana & whey', calories: 450, protein: 35, carbs: 52, fats: 10 },
      { name: 'Egg white omelette with whole grain toast', calories: 380, protein: 32, carbs: 42, fats: 10 },
      { name: 'Greek yogurt with granola & mixed berries', calories: 400, protein: 28, carbs: 48, fats: 10 },
    ],
    lunch: [
      { name: 'Grilled chicken with brown rice & broccoli', calories: 550, protein: 48, carbs: 55, fats: 14 },
      { name: 'Tuna wrap with avocado & salad', calories: 480, protein: 42, carbs: 38, fats: 18 },
      { name: 'Turkey & quinoa bowl with vegetables', calories: 520, protein: 45, carbs: 48, fats: 12 },
    ],
    snack: [
      { name: 'Protein bar or shake', calories: 250, protein: 25, carbs: 22, fats: 6 },
      { name: 'Cottage cheese with pineapple', calories: 200, protein: 22, carbs: 22, fats: 4 },
      { name: 'Rice cakes with peanut butter', calories: 220, protein: 8, carbs: 28, fats: 10 },
    ],
    dinner: [
      { name: 'Lean beef stir-fry with noodles', calories: 580, protein: 48, carbs: 55, fats: 18 },
      { name: 'Grilled fish with sweet potato & greens', calories: 500, protein: 42, carbs: 48, fats: 14 },
      { name: 'Chicken & vegetable curry with brown rice', calories: 560, protein: 45, carbs: 58, fats: 12 },
    ],
  },
  maintenance: {
    breakfast: [
      { name: 'Whole grain cereal with milk & fruit', calories: 350, protein: 12, carbs: 58, fats: 8 },
      { name: 'Avocado toast with poached egg', calories: 380, protein: 18, carbs: 32, fats: 22 },
      { name: 'Smoothie with spinach, banana & almond milk', calories: 300, protein: 8, carbs: 48, fats: 10 },
    ],
    lunch: [
      { name: 'Mediterranean wrap with falafel & hummus', calories: 450, protein: 18, carbs: 55, fats: 18 },
      { name: 'Mixed vegetable soup with whole grain bread', calories: 380, protein: 12, carbs: 58, fats: 8 },
      { name: 'Caprese salad with grilled chicken', calories: 400, protein: 38, carbs: 12, fats: 24 },
    ],
    snack: [
      { name: 'Fresh fruit salad', calories: 120, protein: 2, carbs: 28, fats: 0 },
      { name: 'Dark chocolate & almonds', calories: 200, protein: 6, carbs: 18, fats: 14 },
      { name: 'Yogurt with honey', calories: 150, protein: 8, carbs: 22, fats: 4 },
    ],
    dinner: [
      { name: 'Grilled salmon with roasted vegetables', calories: 480, protein: 42, carbs: 28, fats: 22 },
      { name: 'Chicken & vegetable stir-fry with rice', calories: 520, protein: 42, carbs: 55, fats: 14 },
      { name: 'Lentil dahl with basmati rice', calories: 460, protein: 22, carbs: 72, fats: 8 },
    ],
  },
  general_health: {
    breakfast: [
      { name: 'Whole grain cereal with milk & fruit', calories: 350, protein: 12, carbs: 58, fats: 8 },
      { name: 'Avocado toast with poached egg', calories: 380, protein: 18, carbs: 32, fats: 22 },
      { name: 'Smoothie with spinach, banana & almond milk', calories: 300, protein: 8, carbs: 48, fats: 10 },
    ],
    lunch: [
      { name: 'Mediterranean wrap with falafel & hummus', calories: 450, protein: 18, carbs: 55, fats: 18 },
      { name: 'Mixed vegetable soup with whole grain bread', calories: 380, protein: 12, carbs: 58, fats: 8 },
      { name: 'Caprese salad with grilled chicken', calories: 400, protein: 38, carbs: 12, fats: 24 },
    ],
    snack: [
      { name: 'Fresh fruit salad', calories: 120, protein: 2, carbs: 28, fats: 0 },
      { name: 'Dark chocolate & almonds', calories: 200, protein: 6, carbs: 18, fats: 14 },
      { name: 'Yogurt with honey', calories: 150, protein: 8, carbs: 22, fats: 4 },
    ],
    dinner: [
      { name: 'Grilled salmon with roasted vegetables', calories: 480, protein: 42, carbs: 28, fats: 22 },
      { name: 'Chicken & vegetable stir-fry with rice', calories: 520, protein: 42, carbs: 55, fats: 14 },
      { name: 'Lentil dahl with basmati rice', calories: 460, protein: 22, carbs: 72, fats: 8 },
    ],
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
  const goalLabel = goal.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

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
          {(Object.entries(plan) as [string, any[]][]).map(([meal, options]) => {
            const colors = mealColors[meal as keyof typeof mealColors];
            return (
              <div key={meal} className={`rounded-xl border ${colors.bg} ${colors.border} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{colors.icon}</span>
                  <h3 className={`font-semibold capitalize ${colors.label}`}>{meal}</h3>
                </div>
                <ul className="space-y-3">
                  {options.map((opt: any, i: number) => (
                    <li key={i} className="text-sm text-foreground/90 p-2 rounded-lg bg-white/50 dark:bg-black/10">
                      <span className="font-medium">{opt.name}</span>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{opt.calories} kcal</span>
                        <span>P: {opt.protein}g</span>
                        <span>C: {opt.carbs}g</span>
                        <span>F: {opt.fats}g</span>
                      </div>
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
