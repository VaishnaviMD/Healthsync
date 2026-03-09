import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { foodAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface FoodLog { _id: string; name: string; calories: number; protein: number; carbs: number; fats: number; meal: string; }

const FoodTracker = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '', meal: 'Other' });
  const goal = user?.dailyCalories || 2200;

  const load = async () => {
    try { const r = await foodAPI.getToday(); setEntries(r.data.logs); setTotals(r.data.totals); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addEntry = async () => {
    if (!form.name || !form.calories) return;
    try {
      await foodAPI.add({ ...form, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fats: Number(form.fats) });
      setForm({ name: '', calories: '', protein: '', carbs: '', fats: '', meal: 'Other' });
      load();
    } catch {}
  };

  const deleteEntry = async (id: string) => {
    try { await foodAPI.delete(id); load(); } catch {}
  };

  const progress = Math.min((totals.calories / goal) * 100, 100);
  const remaining = goal - totals.calories;
  const mealGroups = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];

  return (
    <AppLayout title="Food Tracker">
      <div className="max-w-3xl mx-auto space-y-6">
        <PageCard>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-foreground">{totals.calories.toLocaleString()}</p>
            <p className="text-muted-foreground">of {goal.toLocaleString()} kcal consumed</p>
            <p className={`text-sm mt-1 font-medium ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
              {remaining >= 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over goal`}
            </p>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full gradient-primary rounded-full" style={{ width: `${progress}%` }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[{ label: 'Protein', value: totals.protein, unit: 'g', color: 'text-blue-600' }, { label: 'Carbs', value: totals.carbs, unit: 'g', color: 'text-amber-600' }, { label: 'Fats', value: totals.fats, unit: 'g', color: 'text-rose-500' }].map(m => (
              <div key={m.label} className="text-center p-2 bg-muted/50 rounded-lg">
                <p className={`font-bold ${m.color}`}>{m.value.toFixed(0)}{m.unit}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </PageCard>

        <PageCard title="Log a Meal">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'name', label: 'Food Name', placeholder: 'e.g. Oatmeal', colSpan: 'md:col-span-2' },
              { name: 'calories', label: 'Calories', placeholder: '320', type: 'number' },
              { name: 'protein', label: 'Protein (g)', placeholder: '8', type: 'number' },
              { name: 'carbs', label: 'Carbs (g)', placeholder: '54', type: 'number' },
              { name: 'fats', label: 'Fats (g)', placeholder: '6', type: 'number' },
            ].map(f => (
              <div key={f.name} className={`space-y-1 ${f.colSpan || ''}`}>
                <Label className="text-xs">{f.label}</Label>
                <Input name={f.name} type={(f as any).type || 'text'} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-xs">Meal</Label>
              <Select name="meal" value={form.meal} onChange={e => setForm(p => ({ ...p, meal: e.target.value }))}>
                {mealGroups.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
          </div>
          <Button onClick={addEntry} className="mt-4"><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </PageCard>

        <PageCard title="Today's Meals">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No meals logged today yet.</p>
          ) : (
            <div className="space-y-2">
              {entries.map(e => (
                <motion.div key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.meal} • {e.protein}g protein • {e.carbs}g carbs • {e.fats}g fats</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">{e.calories} kcal</span>
                    <button onClick={() => deleteEntry(e._id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </PageCard>
      </div>
    </AppLayout>
  );
};

export default FoodTracker;
