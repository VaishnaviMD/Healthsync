import { useState, useEffect, useCallback, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, Search, Camera, UtensilsCrossed, Loader2, Lightbulb, Flame, Beef, Wheat, Droplets, Leaf } from 'lucide-react';
import { foodAPI } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FoodLog {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  meal: string;
}

interface FoodSearchResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

const MEAL_OPTIONS = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Dinner', label: 'Dinner' },
  { value: 'Snacks', label: 'Snacks' },
  { value: 'Other', label: 'Other' },
];

const MACRO_COLORS = { calories: 'hsl(25, 95%, 53%)', protein: 'hsl(217, 91%, 60%)', carbs: 'hsl(45, 93%, 47%)', fats: 'hsl(350, 89%, 60%)', fiber: 'hsl(142, 71%, 45%)' };

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

const FoodTracker = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  const [insights, setInsights] = useState<{ type: string; message: string; icon: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'photo' | 'ingredients'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [meal, setMeal] = useState('Lunch');
  const [ingredientText, setIngredientText] = useState('');
  const [ingredientResult, setIngredientResult] = useState<{ items: FoodSearchResult[]; total: FoodSearchResult } | null>(null);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState<{ items: FoodSearchResult[]; total: FoodSearchResult } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const goal = user?.dailyCalories || 2200;

  const load = useCallback(async () => {
    try {
      const [todayRes, insightsRes] = await Promise.all([
        foodAPI.getToday(),
        foodAPI.getInsights(),
      ]);
      setEntries(todayRes.data.logs || []);
      setTotals(todayRes.data.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
      setInsights(insightsRes.data.insights || []);
    } catch {
      toast.error('Failed to load data');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    foodAPI.search(debouncedQuery)
      .then((r) => setSearchResults(r.data || []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery]);

  const addEntry = async (payload: { name: string; calories: number; protein: number; carbs: number; fats: number; fiber?: number; meal: string }) => {
    try {
      await foodAPI.add({ ...payload, fiber: payload.fiber ?? 0 });
      toast.success('Meal logged');
      setSelectedFood(null);
      setQuantity('100');
      setIngredientResult(null);
      setIngredientText('');
      setPhotoFile(null);
      setPhotoPreview(null);
      load();
    } catch {
      toast.error('Failed to add');
    }
  };

  const addFromSearch = () => {
    if (!selectedFood) return;
    const qty = parseFloat(quantity) || 100;
    const factor = qty / 100;
    const payload = {
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * factor),
      protein: Math.round(selectedFood.protein * factor * 10) / 10,
      carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
      fats: Math.round(selectedFood.fats * factor * 10) / 10,
      fiber: Math.round((selectedFood.fiber || 0) * factor * 10) / 10,
      meal,
    };
    addEntry(payload);
  };

  const addFromIngredients = () => {
    if (!ingredientResult?.total) return;
    const t = ingredientResult.total;
    addEntry({
      name: `Custom: ${ingredientResult.items.map((i) => i.name).join(', ')}`.slice(0, 80),
      calories: t.calories,
      protein: t.protein,
      carbs: t.carbs,
      fats: t.fats,
      fiber: t.fiber || 0,
      meal,
    });
  };

  const parseIngredients = async () => {
    const lines = ingredientText.split(/\n/).filter((l) => l.trim());
    if (lines.length === 0) {
      toast.error('Enter at least one ingredient');
      return;
    }
    setIngredientLoading(true);
    try {
      const r = await foodAPI.parseIngredients(lines);
      setIngredientResult({ items: r.data.items || [], total: r.data.total || null });
    } catch {
      toast.error('Failed to parse');
    } finally {
      setIngredientLoading(false);
    }
  };

  const analyzePhoto = async () => {
    if (!photoFile) return;
    setPhotoLoading(true);
    setPhotoResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const r = await foodAPI.analyzeImage(base64);
        if (r.data.items?.length > 0 && r.data.total) {
          setPhotoResult({ items: r.data.items, total: r.data.total });
        } else {
          toast.info(r.data.message || 'Could not detect food. Try logging manually or add ingredients.');
        }
      };
      reader.readAsDataURL(photoFile);
    } catch {
      toast.error('Failed to analyze image');
    } finally {
      setPhotoLoading(false);
    }
  };

  const addFromPhoto = () => {
    if (!photoResult?.total) return;
    const t = photoResult.total;
    addEntry({
      name: t.name || 'Photo meal',
      calories: t.calories,
      protein: t.protein,
      carbs: t.carbs,
      fats: t.fats,
      fiber: t.fiber || 0,
      meal,
    });
    setPhotoResult(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const deleteEntry = async (id: string) => {
    try {
      await foodAPI.delete(id);
      toast.success('Entry removed');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const progress = Math.min((totals.calories / goal) * 100, 100);
  const remaining = goal - totals.calories;

  const macroGoals = { protein: 50, carbs: 250, fats: 65, fiber: 25 };
  const macroBars = [
    { key: 'protein', label: 'Protein', value: totals.protein, goal: macroGoals.protein, color: MACRO_COLORS.protein },
    { key: 'carbs', label: 'Carbs', value: totals.carbs, goal: macroGoals.carbs, color: MACRO_COLORS.carbs },
    { key: 'fats', label: 'Fats', value: totals.fats, goal: macroGoals.fats, color: MACRO_COLORS.fats },
    { key: 'fiber', label: 'Fiber', value: totals.fiber, goal: macroGoals.fiber, color: MACRO_COLORS.fiber },
  ];

  const mealGroups = MEAL_OPTIONS.map((m) => ({
    ...m,
    entries: entries.filter((e) => e.meal === m.value || (m.value === 'Snacks' && e.meal === 'Snack')),
  }));

  return (
    <AppLayout title="Food Tracker">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Nutrition Dashboard */}
        <PageCard title="Nutrition Dashboard" subtitle="Today's intake">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="h-4 w-4 text-amber-500" /> Calories
                </span>
                <span className="text-lg font-bold text-foreground">{totals.calories} / {goal} kcal</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: MACRO_COLORS.calories }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.7 }}
                />
              </div>
              <p className={cn('text-sm mt-1', remaining >= 0 ? 'text-muted-foreground' : 'text-rose-600')}>
                {remaining >= 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over`}
              </p>
            </div>
            <div className="space-y-3">
              {macroBars.map((m) => (
                <div key={m.key}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>{m.label}</span>
                    <span className="font-medium">{m.value.toFixed(0)}g / {m.goal}g</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((m.value / m.goal) * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { icon: Beef, label: 'Protein', value: totals.protein, unit: 'g', color: 'text-blue-600' },
              { icon: Wheat, label: 'Carbs', value: totals.carbs, unit: 'g', color: 'text-amber-600' },
              { icon: Droplets, label: 'Fats', value: totals.fats, unit: 'g', color: 'text-rose-500' },
              { icon: Leaf, label: 'Fiber', value: totals.fiber, unit: 'g', color: 'text-emerald-600' },
            ].map(({ icon: Icon, label, value, unit, color }) => (
              <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <Icon className={cn('h-5 w-5', color)} />
                <div>
                  <p className={cn('font-bold', color)}>{value.toFixed(0)}{unit}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </PageCard>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <PageCard title="Smart Insights" subtitle="Based on your nutrition today" className="border-primary/20 bg-primary/5">
            <div className="flex gap-3 mb-3">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                {insights.map((i, idx) => (
                  <p key={idx} className="text-sm text-foreground">{i.message}</p>
                ))}
              </div>
            </div>
          </PageCard>
        )}

        {/* Log Food - Tabs */}
        <PageCard
          title="Log Food"
          subtitle="Search, upload a photo, or add ingredients"
          action={
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['search', 'photo', 'ingredients'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab === 'search' && <Search className="h-4 w-4 inline mr-1.5" />}
                  {tab === 'photo' && <Camera className="h-4 w-4 inline mr-1.5" />}
                  {tab === 'ingredients' && <UtensilsCrossed className="h-4 w-4 inline mr-1.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          }
        >
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label>Search food</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. chicken breast, oatmeal..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="w-24">
                  <Label>Quantity (g)</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" className="mt-1" />
                </div>
                <div className="w-36">
                  <Label>Meal</Label>
                  <Select value={meal} onChange={(e) => setMeal(e.target.value)} className="mt-1">
                    {MEAL_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
              {searchLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {searchResults.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFood(f)}
                      className={cn(
                        'flex justify-between items-center p-3 rounded-xl border text-left transition-colors',
                        selectedFood?.name === f.name ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="font-medium">{f.name}</span>
                      <span className="text-sm text-muted-foreground">{f.calories} kcal • {f.protein}g P</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedFood && (
                <Button onClick={addFromSearch}>
                  <Plus className="h-4 w-4 mr-2" /> Add {selectedFood.name}
                </Button>
              )}
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                {photoPreview ? (
                  <div className="space-y-2">
                    <img src={photoPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                    <p className="text-sm text-muted-foreground">Click to change photo</p>
                  </div>
                ) : (
                  <>
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">Upload a photo of your meal</p>
                    <p className="text-sm text-muted-foreground">AI will detect food and estimate nutrition</p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={meal} onChange={(e) => setMeal(e.target.value)} className="w-40">
                  {MEAL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
                <Button onClick={analyzePhoto} disabled={!photoFile || photoLoading}>
                  {photoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                  {photoLoading ? 'Analyzing...' : 'Detect Food'}
                </Button>
              </div>
              {photoResult && (
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="font-medium">Detected: {photoResult.total.calories} kcal • {photoResult.total.protein}g P • {photoResult.total.carbs}g C • {photoResult.total.fats}g F</p>
                  <Button size="sm" onClick={addFromPhoto}>
                    <Plus className="h-4 w-4 mr-2" /> Add to Log
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Requires OPENAI_API_KEY for photo detection. Add to .env for best results.</p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <div>
                <Label>Add ingredients (one per line)</Label>
                <Textarea
                  value={ingredientText}
                  onChange={(e) => setIngredientText(e.target.value)}
                  placeholder={'200g chicken breast\n100g rice\n50g broccoli\n2 eggs'}
                  className="mt-1 min-h-[100px] resize-y"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={meal} onChange={(e) => setMeal(e.target.value)} className="w-36">
                  {MEAL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
                <Button onClick={parseIngredients} disabled={ingredientLoading}>
                  {ingredientLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UtensilsCrossed className="h-4 w-4 mr-2" />}
                  {ingredientLoading ? 'Calculating...' : 'Calculate Nutrition'}
                </Button>
              </div>
              {ingredientResult && (
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="font-medium">Total: {ingredientResult.total.calories} kcal • {ingredientResult.total.protein}g P • {ingredientResult.total.carbs}g C • {ingredientResult.total.fats}g F</p>
                  <Button size="sm" onClick={addFromIngredients}>
                    <Plus className="h-4 w-4 mr-2" /> Add to Log
                  </Button>
                </div>
              )}
            </div>
          )}
        </PageCard>

        {/* Today's Meals by Category */}
        <PageCard title="Today's Meals" subtitle="By category">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No meals logged today yet.</p>
          ) : (
            <div className="space-y-4">
              {mealGroups.map((group) =>
                group.entries.length > 0 ? (
                  <div key={group.value}>
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-2">{group.label}</p>
                    <div className="space-y-2">
                      {group.entries.map((e) => (
                        <motion.div
                          key={e._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/40"
                        >
                          <div>
                            <p className="font-medium text-foreground">{e.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {e.protein}g protein • {e.carbs}g carbs • {e.fats}g fats{e.fiber ? ` • ${e.fiber}g fiber` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">{e.calories} kcal</span>
                            <button onClick={() => deleteEntry(e._id)} className="text-muted-foreground hover:text-destructive p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </PageCard>
      </div>
    </AppLayout>
  );
};

export default FoodTracker;
