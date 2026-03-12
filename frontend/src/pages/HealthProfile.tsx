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
import { User, Activity, Target, Scale, ClipboardList, AlertCircle } from 'lucide-react';
import { healthReportAPI } from '@/services/api';

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
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', age: String(user.age || ''), height: String(user.height || ''), weight: String(user.weight || ''), healthGoal: user.healthGoal || 'general_health' });
  }, [user]);

  useEffect(() => {
    healthReportAPI.get().then(r => setReport(r.data)).catch(() => setReport(null));
  }, [user]);

  const bmi = form.height && form.weight ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1) : null;
  const getBmiCategory = (b: number) => b < 18.5 ? { label: 'Underweight', color: 'text-blue-500' } : b < 25 ? { label: 'Normal', color: 'text-success' } : b < 30 ? { label: 'Overweight', color: 'text-amber-500' } : { label: 'Obese', color: 'text-destructive' };

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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {} finally { setLoading(false); }
  };

  return (
    <AppLayout title="Health Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {!user?.surveyCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-foreground">Complete your health survey</p>
                <p className="text-sm text-muted-foreground">Get a personalized health report and recommendations</p>
              </div>
            </div>
            <Link to="/survey"><Button size="sm">Start Survey</Button></Link>
          </motion.div>
        )}

        {report && (
          <PageCard title="Health Score" subtitle="Your overall health assessment">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{report.healthScore}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{report.healthScore} / 100</p>
                <p className="text-sm text-muted-foreground mt-1">{report.summary}</p>
              </div>
            </div>
          </PageCard>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Scale, label: 'BMI', value: (report?.bmi ?? bmi) || '—', sub: (report?.bmiCategory || (bmi ? getBmiCategory(Number(bmi)).label : 'Enter height & weight')), color: bmi ? getBmiCategory(Number(bmi)).color : 'text-muted-foreground' },
            { icon: Activity, label: 'Daily Calories', value: dailyCalories.toLocaleString(), sub: 'kcal recommended', color: 'text-primary' },
            { icon: Target, label: 'Health Goal', value: form.healthGoal.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), sub: 'Current goal', color: 'text-foreground' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {report && (report.recommendations?.length || report.dietTips?.length || report.exerciseSuggestions?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.recommendations?.length ? (
              <PageCard title="Recommendations">
                <ul className="space-y-2 text-sm">
                  {report.recommendations.map((r, i) => <li key={i} className="flex gap-2"><AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{r}</li>)}
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

        <PageCard title="Edit Profile" action={<User className="h-5 w-5 text-muted-foreground" />}>
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
              ✓ Profile updated successfully
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="Years" />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} placeholder="e.g. 165" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 60" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Health Goal</Label>
                <Select value={form.healthGoal} onChange={e => setForm(p => ({ ...p, healthGoal: e.target.value }))}>
                  <option value="general_health">General Health</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="fitness">Fitness</option>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</Button>
          </form>
        </PageCard>
      </div>
    </AppLayout>
  );
};

export default HealthProfile;
