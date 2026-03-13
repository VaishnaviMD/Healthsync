import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Activity, Target, Scale, ClipboardList, Droplets, Moon, Zap } from 'lucide-react';
import { healthReportAPI } from '@/services/api';
import { toast } from 'sonner';

interface HealthReport {
  healthScore: number;
  bmi?: number;
  bmiCategory?: string;
  dailyCalories?: number;
  hydrationRecommendation?: string;
  sleepHealth?: string;
  stressLevel?: string;
  fitnessLevel?: string;
  riskIndicators?: string[];
  recommendations?: string[];
  dietTips?: string[];
  exerciseSuggestions?: string[];
  summary?: string;
}

const HealthProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', age: '', height: '', weight: '', healthGoal: 'general_health' });
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(true);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', age: String(user.age || ''), height: String(user.height || ''), weight: String(user.weight || ''), healthGoal: user.healthGoal || 'general_health' });
  }, [user]);

  useEffect(() => {
    setReportLoading(true);
    healthReportAPI.get().then(r => setReport(r.data)).catch(() => setReport(null)).finally(() => setReportLoading(false));
  }, [user]);

  const bmi = form.height && form.weight ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1) : null;
  const getBmiCategory = (b: number) => b < 18.5 ? { label: 'Underweight', color: 'text-blue-500' } : b < 25 ? { label: 'Normal', color: 'text-emerald-700 dark:text-emerald-400' } : b < 30 ? { label: 'Overweight', color: 'text-amber-600' } : { label: 'Obese', color: 'text-destructive' };

  let dailyCalories = report?.dailyCalories || user?.dailyCalories || 2000;
  if (!report && form.age && form.height && form.weight) {
    dailyCalories = Math.round(10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + 5);
    if (form.healthGoal === 'weight_loss') dailyCalories -= 500;
    if (form.healthGoal === 'weight_gain') dailyCalories += 500;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Health Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        {!user?.surveyCompleted && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                <ClipboardList className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Complete your health survey</p>
                <p className="text-sm text-muted-foreground mt-0.5">Get a personalized health report and recommendations</p>
              </div>
            </div>
            <Link to="/survey"><Button size="lg">Start Survey</Button></Link>
          </motion.div>
        )}

        {reportLoading ? (
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        ) : report && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PageCard className="overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(158, 64%, 45%)" strokeWidth="3" strokeDasharray={`${report.healthScore}, 100`} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">{report.healthScore}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">Health Score</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your overall health assessment</p>
                  {report.summary && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{report.summary}</p>}
                </div>
              </div>
            </PageCard>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Scale, label: 'BMI', value: (report?.bmi ?? bmi) || '—', sub: report?.bmiCategory || (bmi ? getBmiCategory(Number(bmi)).label : '—'), color: bmi ? getBmiCategory(Number(bmi)).color : 'text-muted-foreground' },
                { icon: Activity, label: 'Daily Calories', value: dailyCalories.toLocaleString(), sub: 'kcal', color: 'text-primary' },
                { icon: Target, label: 'Health Goal', value: form.healthGoal.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), sub: 'Current', color: 'text-foreground' },
                { icon: Droplets, label: 'Hydration', value: report?.hydrationRecommendation ? '—' : '—', sub: report?.hydrationRecommendation?.slice(0, 30) + '...' || '—', color: 'text-blue-600' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <stat.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {report && (report.recommendations?.length || report.dietTips?.length || report.exerciseSuggestions?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {report.recommendations?.length ? (
              <PageCard title="Recommendations">
                <ul className="space-y-2 text-sm">
                  {report.recommendations.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary mt-1">•</span>{r}</li>)}
                </ul>
              </PageCard>
            ) : null}
            {report.dietTips?.length ? (
              <PageCard title="Diet Tips">
                <ul className="space-y-2 text-sm">{report.dietTips.map((t, i) => <li key={i}>• {t}</li>)}</ul>
              </PageCard>
            ) : null}
            {report.exerciseSuggestions?.length ? (
              <PageCard title="Exercise Suggestions">
                <ul className="space-y-2 text-sm">{report.exerciseSuggestions.map((e, i) => <li key={i}>• {e}</li>)}</ul>
              </PageCard>
            ) : null}
          </div>
        )}

        <PageCard title="Edit Profile">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="Years" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} placeholder="e.g. 165" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 60" className="rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Health Goal</Label>
                <Select value={form.healthGoal} onChange={e => setForm(p => ({ ...p, healthGoal: e.target.value }))} className="rounded-xl">
                  <option value="general_health">General Health</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="fitness">Fitness</option>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading} size="lg">{loading ? 'Saving...' : 'Save Profile'}</Button>
          </form>
        </PageCard>
      </div>
    </AppLayout>
  );
};

export default HealthProfile;
