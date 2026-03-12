import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard, PageCard } from '@/components/StatCard';
import { Flame, Pill, Zap, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { foodAPI, medicineAPI, wellnessAPI, healthReportAPI, fitnessAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(210, 20%, 80%)'];

const Dashboard = () => {
  const { user } = useAuth();
  const [weeklyCalories, setWeeklyCalories] = useState<any[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [adherence, setAdherence] = useState({ taken: 0, total: 0, adherencePercent: 0 });
  const [todayCalories, setTodayCalories] = useState(0);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [fitnessStreak, setFitnessStreak] = useState(0);

  useEffect(() => {
    foodAPI.getToday().then(r => {
      setTodayCalories(r.data.totals?.calories || 0);
    }).catch(() => {});
    foodAPI.getWeekly().then(r => {
      const data = r.data.map((d: any) => ({ ...d, goal: user?.dailyCalories || 2200 }));
      setWeeklyCalories(data);
    }).catch(() => {});
    medicineAPI.getAdherence().then(r => {
      setAdherence({ taken: r.data.taken, total: r.data.total, adherencePercent: r.data.adherencePercent });
    }).catch(() => {});
    wellnessAPI.getAll().then(r => {
      const logs = r.data.slice(0, 7).reverse();
      const levelMap: Record<string, number> = { low: 3, medium: 6, high: 9 };
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      setEnergyData(logs.map((l: any) => ({
        day: days[new Date(l.date).getDay()],
        level: levelMap[l.energyLevel] || 5,
      })));
    }).catch(() => {});
    healthReportAPI.get().then(r => setHealthScore(r.data.healthScore)).catch(() => setHealthScore(null));
    fitnessAPI.getStreak().then(r => setFitnessStreak(r.data.streak || 0)).catch(() => setFitnessStreak(0));
  }, [user]);

  const adherencePct = adherence.adherencePercent ?? (adherence.total > 0 ? Math.round((adherence.taken / adherence.total) * 100) : 0);
  const medicineData = [{ name: 'Taken', value: adherencePct }, { name: 'Missed', value: 100 - adherencePct }];

  const weightData = [
    { week: 'W1', weight: user?.weight ? user.weight + 2 : 74 },
    { week: 'W2', weight: user?.weight ? user.weight + 1.5 : 73.5 },
    { week: 'W3', weight: user?.weight ? user.weight + 0.8 : 73.2 },
    { week: 'W4', weight: user?.weight || 72 },
  ];

  const displayCalories = todayCalories || 0;

  return (
    <AppLayout title="Dashboard">
      <motion.div className="space-y-6" initial="initial" animate="animate">
        {healthScore != null && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            <p className="text-sm text-muted-foreground">Your Health Score</p>
            <p className="text-4xl font-bold text-primary">{healthScore} <span className="text-2xl text-muted-foreground">/ 100</span></p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard index={0} icon={Flame} title="Calories Today" value={displayCalories.toLocaleString()} subtitle={`of ${user?.dailyCalories || 2200} kcal`} trend="up" trendValue="Today's intake" />
          <StatCard index={1} icon={Pill} title="Medicine Adherence" value={`${adherencePct}%`} subtitle="Current week" trend={adherencePct >= 80 ? 'up' : 'down'} trendValue={`${adherence.taken}/${adherence.total || '–'} taken`} />
          <StatCard index={2} icon={Zap} title="Energy Level" value={energyData.length ? `${Math.round(energyData.reduce((s: number, d: any) => s + d.level, 0) / energyData.length)}/10` : '–/10'} subtitle={energyData.length ? 'From wellness' : 'Log in Wellness'} trend="up" trendValue={fitnessStreak > 0 ? `${fitnessStreak} day streak` : 'Track activity'} />
          <StatCard index={3} icon={Scale} title="Weight" value={`${user?.weight || 72} kg`} subtitle={user?.bmi ? `BMI: ${user.bmi}` : 'Set in profile'} trend="down" trendValue="-0.5 kg this week" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PageCard title="Calorie Intake" subtitle="Daily intake vs goal">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyCalories.length ? weeklyCalories : [
                { day: 'Mon', intake: 1800, goal: 2200 }, { day: 'Tue', intake: 2100, goal: 2200 },
                { day: 'Wed', intake: 1950, goal: 2200 }, { day: 'Thu', intake: 2300, goal: 2200 },
                { day: 'Fri', intake: 2050, goal: 2200 }, { day: 'Sat', intake: 2400, goal: 2200 },
                { day: 'Sun', intake: 1900, goal: 2200 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="day" stroke="hsl(210, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(210, 10%, 50%)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(210,20%,90%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="intake" fill="hsl(158, 64%, 40%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="goal" fill="hsl(210, 20%, 88%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </PageCard>

          <PageCard title="Medicine Adherence" subtitle="This week's compliance">
            <div className="flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={medicineData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" stroke="none">
                    {medicineData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-foreground">{adherencePct}%</p>
                <p className="text-xs text-muted-foreground">Adherence</p>
              </div>
            </div>
          </PageCard>

          <PageCard title="Energy Level Trend" subtitle="Daily energy scores">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={energyData.length ? energyData : [
                { day: 'Mon', level: 7 }, { day: 'Tue', level: 6 }, { day: 'Wed', level: 8 },
                { day: 'Thu', level: 5 }, { day: 'Fri', level: 7 }, { day: 'Sat', level: 9 }, { day: 'Sun', level: 8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="day" stroke="hsl(210, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(210, 10%, 50%)" fontSize={12} domain={[0, 10]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(210,20%,90%)' }} />
                <Area type="monotone" dataKey="level" stroke="hsl(207, 70%, 55%)" fill="hsl(207, 70%, 55%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </PageCard>

          <PageCard title="Weight Progress" subtitle="Weekly tracking">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="week" stroke="hsl(210, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(210, 10%, 50%)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(210,20%,90%)' }} />
                <Line type="monotone" dataKey="weight" stroke="hsl(158, 64%, 40%)" strokeWidth={2} dot={{ fill: 'hsl(158, 64%, 40%)', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </PageCard>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
