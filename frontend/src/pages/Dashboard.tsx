import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatCard, PageCard } from '@/components/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/skeleton';
import { Flame, Pill, Zap, Scale, Droplets, Trophy, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { foodAPI, medicineAPI, wellnessAPI, healthReportAPI, fitnessAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(210, 20%, 80%)'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyCalories, setWeeklyCalories] = useState<any[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [adherence, setAdherence] = useState({ taken: 0, total: 0, adherencePercent: 0 });
  const [todayCalories, setTodayCalories] = useState(0);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [fitnessStreak, setFitnessStreak] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    const goal = user?.dailyCalories || 2200;
    Promise.all([
      foodAPI.getToday().then(r => { setTodayCalories(r.data.totals?.calories || 0); }),
      foodAPI.getWeekly().then(r => setWeeklyCalories(r.data.map((d: any) => ({ ...d, goal })))),
      medicineAPI.getAdherence().then(r => setAdherence({ taken: r.data.taken, total: r.data.total, adherencePercent: r.data.adherencePercent })),
      wellnessAPI.getAll().then(r => {
        const logs = r.data.slice(0, 7).reverse();
        const levelMap: Record<string, number> = { low: 3, medium: 6, high: 9 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        setEnergyData(logs.map((l: any) => ({ day: days[new Date(l.date).getDay()], level: levelMap[l.energyLevel] || 5 })));
      }),
      wellnessAPI.getToday().then(r => setWaterIntake(Math.round((r.data.waterIntake || 0) * 4))).catch(() => setWaterIntake(0)),
      healthReportAPI.get().then(r => setHealthScore(r.data.healthScore)).catch(() => setHealthScore(null)),
      fitnessAPI.getStreak().then(r => setFitnessStreak(r.data.streak || 0)).catch(() => setFitnessStreak(0)),
    ]).finally(() => setLoading(false));
  }, [user]);

  const adherencePct = adherence.adherencePercent ?? (adherence.total > 0 ? Math.round((adherence.taken / adherence.total) * 100) : 0);
  const medicineData = [{ name: 'Taken', value: adherencePct }, { name: 'Missed', value: 100 - adherencePct }];
  const goal = user?.dailyCalories || 2200;
  const waterGoal = 8;
  const energyAvg = energyData.length ? Math.round(energyData.reduce((s: number, d: any) => s + d.level, 0) / energyData.length) : 0;

  const weightData = [
    { week: 'W1', weight: user?.weight ? user.weight + 2 : 74 },
    { week: 'W2', weight: user?.weight ? user.weight + 1.5 : 73.5 },
    { week: 'W3', weight: user?.weight ? user.weight + 0.8 : 73.2 },
    { week: 'W4', weight: user?.weight || 72 },
  ];

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <ChartSkeleton key={i} />)}
          </div>
        </motion.div>
      </AppLayout>
    );
  }

  const metrics = [
    { icon: Trophy, title: 'Health Score', value: healthScore != null ? `${healthScore}` : '–', subtitle: 'out of 100', trend: healthScore && healthScore >= 70 ? 'up' : 'neutral', trendValue: healthScore != null ? 'Complete survey for score' : 'Complete survey', link: '/survey' },
    { icon: Flame, title: 'Calories Today', value: `${todayCalories.toLocaleString()}`, subtitle: `of ${goal} kcal`, trend: todayCalories >= goal * 0.8 ? 'up' : 'neutral', trendValue: todayCalories > 0 ? `${goal - todayCalories} kcal remaining` : 'Log your meals', link: '/food-tracker' },
    { icon: Pill, title: 'Medicine Adherence', value: `${adherencePct}%`, subtitle: `${adherence.taken}/${adherence.total || '–'} taken`, trend: adherencePct >= 80 ? 'up' : adherencePct > 0 ? 'down' : 'neutral', trendValue: adherence.total ? 'Today\'s doses' : 'Add medicines', link: '/medicines' },
    { icon: Zap, title: 'Fitness Streak', value: `${fitnessStreak}`, subtitle: 'consecutive days', trend: fitnessStreak > 0 ? 'up' : 'neutral', trendValue: fitnessStreak > 0 ? 'Keep it up!' : 'Log activity', link: '/fitness' },
    { icon: Activity, title: 'Energy Level', value: energyData.length ? `${energyAvg}/10` : '–/10', subtitle: 'from wellness', trend: energyAvg >= 6 ? 'up' : 'neutral', trendValue: energyData.length ? '7-day average' : 'Log in Wellness', link: '/wellness' },
    { icon: Droplets, title: 'Water Intake', value: `${waterIntake}`, subtitle: `of ${waterGoal} glasses`, trend: waterIntake >= waterGoal ? 'up' : 'neutral', trendValue: waterIntake >= waterGoal ? 'Goal reached!' : 'Log in Wellness', link: '/wellness' },
  ];

  return (
    <AppLayout title="Dashboard">
      <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={m.title} variants={item}>
              {m.link ? (
                <Link to={m.link}>
                  <StatCard index={i} icon={m.icon} title={m.title} value={m.value} subtitle={m.subtitle} trend={m.trend} trendValue={m.trendValue} className="h-full hover:shadow-lg transition-shadow cursor-pointer" />
                </Link>
              ) : (
                <StatCard index={i} icon={m.icon} title={m.title} value={m.value} subtitle={m.subtitle} trend={m.trend} trendValue={m.trendValue} />
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <PageCard title="Calorie Intake" subtitle="Daily intake vs goal" className="shadow-sm">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyCalories.length ? weeklyCalories : [
                  { day: 'Mon', intake: 1800, goal: 2200 }, { day: 'Tue', intake: 2100, goal: 2200 },
                  { day: 'Wed', intake: 1950, goal: 2200 }, { day: 'Thu', intake: 2300, goal: 2200 },
                  { day: 'Fri', intake: 2050, goal: 2200 }, { day: 'Sat', intake: 2400, goal: 2200 },
                  { day: 'Sun', intake: 1900, goal: 2200 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="intake" fill="hsl(158, 64%, 40%)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="goal" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </PageCard>
          </motion.div>

          <motion.div variants={item}>
            <PageCard title="Medicine Adherence" subtitle="This week's compliance" className="shadow-sm">
              <div className="flex items-center justify-center relative py-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={medicineData} cx="50%" cy="50%" innerRadius={75} outerRadius={110} dataKey="value" stroke="none" animationBegin={0} animationDuration={800}>
                      {medicineData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-bold text-foreground">{adherencePct}%</p>
                  <p className="text-sm text-muted-foreground">Adherence</p>
                </div>
              </div>
            </PageCard>
          </motion.div>

          <motion.div variants={item}>
            <PageCard title="Energy Level Trend" subtitle="Daily energy scores" className="shadow-sm">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={energyData.length ? energyData : [
                  { day: 'Mon', level: 7 }, { day: 'Tue', level: 6 }, { day: 'Wed', level: 8 },
                  { day: 'Thu', level: 5 }, { day: 'Fri', level: 7 }, { day: 'Sat', level: 9 }, { day: 'Sun', level: 8 },
                ]}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(207, 70%, 55%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(207, 70%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 10]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="level" stroke="hsl(207, 70%, 55%)" fill="url(#energyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </PageCard>
          </motion.div>

          <motion.div variants={item}>
            <PageCard title="Weight Progress" subtitle="Weekly tracking" className="shadow-sm">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="weight" stroke="hsl(158, 64%, 40%)" strokeWidth={2} dot={{ fill: 'hsl(158, 64%, 40%)', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </PageCard>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
