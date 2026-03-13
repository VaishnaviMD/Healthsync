import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { wellnessAPI } from '@/services/api';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const WellnessTracker = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ energyLevel: 'medium', waterIntake: '', sleepHours: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = async () => {
    try { const r = await wellnessAPI.getAll(); setLogs(r.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await wellnessAPI.add({ ...form, waterIntake: Number(form.waterIntake), sleepHours: Number(form.sleepHours) });
      toast.success('Wellness log saved');
      setForm({ energyLevel: 'medium', waterIntake: '', sleepHours: '', notes: '' });
      setSuccess(true); setTimeout(() => setSuccess(false), 2500); load();
    } catch {} finally { setLoading(false); }
  };

  const levelMap: Record<string, number> = { low: 3, medium: 6, high: 9 };
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = logs.slice(0, 7).reverse().map(l => ({
    day: days[new Date(l.date).getDay()],
    energy: levelMap[l.energyLevel] || 5,
    sleep: l.sleepHours || 0,
    water: l.waterIntake || 0,
  }));

  return (
    <AppLayout title="Wellness Tracker">
      <div className="max-w-3xl mx-auto space-y-6">
        <PageCard title="Log Today's Wellness">
          {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">✓ Wellness log saved!</motion.div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Energy Level</Label>
              <Select value={form.energyLevel} onChange={e => setForm(p => ({ ...p, energyLevel: e.target.value }))}>
                <option value="low">Low 😴</option>
                <option value="medium">Medium 😊</option>
                <option value="high">High ⚡</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Water Intake (litres)</Label>
              <Input type="number" step="0.1" value={form.waterIntake} onChange={e => setForm(p => ({ ...p, waterIntake: e.target.value }))} placeholder="e.g. 2.5" required />
            </div>
            <div className="space-y-2">
              <Label>Sleep Hours</Label>
              <Input type="number" step="0.5" value={form.sleepHours} onChange={e => setForm(p => ({ ...p, sleepHours: e.target.value }))} placeholder="e.g. 7.5" required />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="How are you feeling?" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Log Wellness'}</Button>
            </div>
          </form>
        </PageCard>

        {chartData.length > 0 && (
          <>
            <PageCard title="Energy Trend" subtitle="Last 7 days">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis domain={[0, 10]} fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="energy" stroke="hsl(158, 64%, 40%)" fill="hsl(158, 64%, 40%)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </PageCard>
            <div className="grid grid-cols-2 gap-4">
              <PageCard title="Sleep Trend">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} domain={[0, 12]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sleep" stroke="hsl(207, 70%, 55%)" fill="hsl(207, 70%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </PageCard>
              <PageCard title="Water Intake">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} domain={[0, 4]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="water" stroke="hsl(200, 80%, 50%)" fill="hsl(200, 80%, 50%)" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </PageCard>
            </div>
          </>
        )}

        {logs.length > 0 && (
          <PageCard title="Recent Logs">
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => (
                <div key={log._id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-sm">
                  <span className="text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                  <span className={`font-medium capitalize ${log.energyLevel === 'high' ? 'text-success' : log.energyLevel === 'low' ? 'text-destructive' : 'text-foreground'}`}>
                    {log.energyLevel} energy
                  </span>
                  <span className="text-muted-foreground">💧 {log.waterIntake}L</span>
                  <span className="text-muted-foreground">😴 {log.sleepHours}h</span>
                </div>
              ))}
            </div>
          </PageCard>
        )}
      </div>
    </AppLayout>
  );
};

export default WellnessTracker;
