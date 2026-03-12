import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, Footprints, Flame } from 'lucide-react';
import { fitnessAPI } from '@/services/api';
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

const FitnessTracker = () => {
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

  return (
    <AppLayout title="Fitness Tracker">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <PageCard title="Log Activity" action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add</Button>}>
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
      </div>
    </AppLayout>
  );
};

export default FitnessTracker;
