import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, Footprints, Flame, Info, PlayCircle, Activity, HeartPulse } from 'lucide-react';
import { fitnessAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface FitnessLog {
  _id: string;
  date: string;
  steps: number;
  workoutType?: string;
  workoutDuration?: number;
  caloriesBurned?: number;
  notes?: string;
}

type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface SuggestedWorkout {
  name: string;
  category: 'stretching' | 'yoga' | 'cardio' | 'strength' | 'breathing';
  difficulty: WorkoutDifficulty;
  durationMin: number;
  estimatedCalories: number;
  link: string;
  description: string;
}

const WORKOUT_LIBRARY: SuggestedWorkout[] = [
  {
    name: '10-min Morning Stretch',
    category: 'stretching',
    difficulty: 'beginner',
    durationMin: 10,
    estimatedCalories: 30,
    link: 'https://www.youtube.com/results?search_query=10+minute+full+body+stretch',
    description: 'Gentle full-body stretches to wake up joints and muscles.',
  },
  {
    name: 'Beginner Walk + Light Cardio',
    category: 'cardio',
    difficulty: 'beginner',
    durationMin: 20,
    estimatedCalories: 80,
    link: 'https://www.youtube.com/results?search_query=20+minute+indoor+walking+workout',
    description: 'Low-impact walking session, ideal if you are just starting.',
  },
  {
    name: 'Low-Impact Yoga Flow',
    category: 'yoga',
    difficulty: 'beginner',
    durationMin: 15,
    estimatedCalories: 60,
    link: 'https://www.youtube.com/results?search_query=15+minute+beginner+yoga',
    description: 'Slow-paced yoga for mobility and relaxation.',
  },
  {
    name: '30-min Cardio for Fat Loss',
    category: 'cardio',
    difficulty: 'intermediate',
    durationMin: 30,
    estimatedCalories: 220,
    link: 'https://www.youtube.com/results?search_query=30+minute+cardio+workout',
    description: 'Moderate intensity cardio session to improve endurance.',
  },
  {
    name: 'Bodyweight Strength Circuit',
    category: 'strength',
    difficulty: 'intermediate',
    durationMin: 25,
    estimatedCalories: 180,
    link: 'https://www.youtube.com/results?search_query=bodyweight+strength+workout',
    description: 'Squats, lunges, push-ups, and core work with no equipment.',
  },
  {
    name: 'Guided Box Breathing',
    category: 'breathing',
    difficulty: 'beginner',
    durationMin: 5,
    estimatedCalories: 10,
    link: 'https://www.youtube.com/results?search_query=box+breathing+exercise',
    description: 'Slow breathing to calm the nervous system and reduce stress.',
  },
  {
    name: '45-min Strength & Conditioning',
    category: 'strength',
    difficulty: 'advanced',
    durationMin: 45,
    estimatedCalories: 350,
    link: 'https://www.youtube.com/results?search_query=45+minute+strength+and+conditioning+workout',
    description: 'Higher intensity strength training with compound movements.',
  },
  {
    name: 'HIIT Cardio Intervals',
    category: 'cardio',
    difficulty: 'advanced',
    durationMin: 20,
    estimatedCalories: 260,
    link: 'https://www.youtube.com/results?search_query=20+minute+hiit+workout',
    description: 'Short bursts of intense effort followed by recovery periods.',
  },
];

const FitnessTracker = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [form, setForm] = useState({ steps: '', workoutType: '', workoutDuration: '', caloriesBurned: '', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [logsRes, streakRes] = await Promise.all([fitnessAPI.getAll(), fitnessAPI.getStreak()]);
      setLogs(logsRes.data);
      setStreak(streakRes.data.streak || 0);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fitnessAPI.add({
        steps: Number(form.steps) || 0,
        workoutType: form.workoutType || undefined,
        workoutDuration: Number(form.workoutDuration) || undefined,
        caloriesBurned: Number(form.caloriesBurned) || undefined,
        notes: form.notes || undefined,
      });
      setForm({ steps: '', workoutType: '', workoutDuration: '', caloriesBurned: '', notes: '' });
      setShowForm(false);
      load();
    } catch {} finally { setLoading(false); }
  };

  const deleteLog = async (id: string) => {
    try { await fitnessAPI.delete(id); load(); } catch {}
  };

  const workoutTypes = ['Walking', 'Running', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'HIIT', 'Other'];

  const difficulty: WorkoutDifficulty = useMemo(() => {
    const age = user?.age || 30;
    const goal = user?.healthGoal || 'general_health';
    const level = user?.activityLevel || '';
    if (goal === 'weight_loss' || goal === 'fitness') {
      if (level === 'active' || level === 'very_active') return 'advanced';
      if (level === 'moderate') return 'intermediate';
    }
    if (age > 55 || level === 'sedentary') return 'beginner';
    return 'intermediate';
  }, [user]);

  const suggestedWorkouts = useMemo(
    () => WORKOUT_LIBRARY.filter(w => w.difficulty === difficulty),
    [difficulty]
  );

  const weeklySteps = logs
    .slice(0, 7)
    .reduce((s, l) => s + (l.steps || 0), 0);
  const today = new Date().toDateString();
  const todaySteps = logs.find(l => new Date(l.date).toDateString() === today)?.steps || 0;
  const stepsGoal = 8000;

  return (
    <AppLayout title="Fitness Tracker">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PageCard>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Footprints className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fitness Streak</p>
                <p className="text-2xl font-bold text-foreground">{streak} days</p>
                <p className="text-xs text-muted-foreground">Consecutive days with activity</p>
              </div>
            </div>
          </PageCard>
          <PageCard>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-foreground">
                  {logs.slice(0, 7).reduce((s, l) => s + (l.caloriesBurned || 0), 0)} kcal
                </p>
                <p className="text-xs text-muted-foreground">Calories burned</p>
              </div>
            </div>
          </PageCard>
          <PageCard>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Today&apos;s Steps</p>
                <p className="text-2xl font-bold text-foreground">{todaySteps.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {stepsGoal.toLocaleString()} steps •{' '}
                  {todaySteps >= stepsGoal
                    ? 'Goal reached — great job!'
                    : `${(stepsGoal - todaySteps).toLocaleString()} steps to go`}
                </p>
              </div>
            </div>
          </PageCard>
          <PageCard title="Fitness Tips" action={<Info className="h-4 w-4 text-primary" />}>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>Walk at least 8,000–10,000 steps most days for heart health.</li>
              <li>Include strength training on 2–3 days per week to protect muscles and bones.</li>
              <li>Do a short stretch routine after workouts to support recovery and prevent injury.</li>
              <li>On busy days, combine movement into routines: stairs, short walking calls, or 10-min bursts.</li>
            </ul>
          </PageCard>
        </div>

        <PageCard title="Log Activity" subtitle="Track steps, workouts, and calories" action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add</Button>}>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Steps</Label><Input name="steps" type="number" value={form.steps} onChange={handleChange} placeholder="5000" /></div>
                <div><Label>Workout Type</Label><Select name="workoutType" value={form.workoutType} onChange={handleChange}><option value="">Select</option>{workoutTypes.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                <div><Label>Duration (min)</Label><Input name="workoutDuration" type="number" value={form.workoutDuration} onChange={handleChange} placeholder="30" /></div>
                <div><Label>Calories Burned</Label><Input name="caloriesBurned" type="number" value={form.caloriesBurned} onChange={handleChange} placeholder="200" /></div>
              </div>
              <div><Label>Notes</Label><Input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes" /></div>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </form>
          )}
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity logged yet. Add your first workout or steps!</p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <motion.div key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/50">
                  <div>
                    <p className="font-medium text-foreground">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.steps ? `${log.steps} steps` : ''} {log.workoutType ? `• ${log.workoutType}` : ''} {log.workoutDuration ? `${log.workoutDuration} min` : ''} {log.caloriesBurned ? `• ${log.caloriesBurned} kcal burned` : ''}
                    </p>
                  </div>
                  <button onClick={() => deleteLog(log._id)} className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </motion.div>
              ))}
            </div>
          )}
        </PageCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PageCard title="Suggested Workouts" subtitle="Based on your profile" className="lg:col-span-2">
            <p className="text-xs text-muted-foreground mb-3">
              We recommend {difficulty === 'beginner' ? 'gentle, low‑impact' : difficulty === 'intermediate' ? 'moderate intensity' : 'more advanced'} routines
              based on your age, goal, and activity level. Always follow your doctor&apos;s advice.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedWorkouts.map(w => (
                <div key={w.name} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-foreground">{w.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {w.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{w.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                    <span>{w.durationMin} min</span>
                    <span>≈ {w.estimatedCalories} kcal</span>
                    <span className="capitalize">{w.category}</span>
                  </div>
                  <a
                    href={w.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    View tutorial
                  </a>
                </div>
              ))}
            </div>
          </PageCard>

          <PageCard title="Helpful Apps & Platforms">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Home workout apps:</span> Explore apps like Nike Training Club, FitOn, or YouTube fitness channels for guided routines.
              </li>
              <li>
                <span className="font-semibold text-foreground">Yoga & stretching:</span> Try Yoga with Adriene, Down Dog, or simple 10‑minute yoga flows for flexibility.
              </li>
              <li>
                <span className="font-semibold text-foreground">Meditation & breathing:</span> Apps like Headspace, Calm, or Insight Timer can support stress and recovery.
              </li>
              <li className="flex items-start gap-2 mt-1 text-[11px]">
                <HeartPulse className="h-3.5 w-3.5 text-primary mt-0.5" />
                <span>
                  These suggestions are for general wellness only and not medical advice. Choose movements that feel safe for your body.
                </span>
              </li>
            </ul>
          </PageCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default FitnessTracker;
