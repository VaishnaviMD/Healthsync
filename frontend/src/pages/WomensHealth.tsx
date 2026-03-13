import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Baby,
  Calendar,
  Heart,
  Info,
  Smile,
  AlertTriangle,
  Droplets,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

const PERIOD_SYMPTOMS = ["Cramps", "Headache", "Fatigue", "Mood swings", "Bloating", "Acne"];
const PREGNANCY_SYMPTOMS = ["Nausea", "Fatigue", "Swelling", "Back pain", "Cravings"];
const MOODS = ["happy", "stressed", "anxious", "tired", "energetic"];

type TabKey = "cycle" | "pregnancy" | "education";

const WomensHealth = () => {
  const [tab, setTab] = useState<TabKey>("cycle");

  // Cycle state
  const [predictions, setPredictions] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [cycleForm, setCycleForm] = useState({
    lastPeriodDate: "",
    periodEndDate: "",
    cycleLength: "28",
    periodDuration: "5",
    flowIntensity: "moderate",
    symptoms: [] as string[],
    mood: "",
  });

  // Pregnancy state
  const [pregnancyMode, setPregnancyMode] = useState(false);
  const [pregnancyProfile, setPregnancyProfile] = useState<any>(null);
  const [pregnancyDerived, setPregnancyDerived] = useState<any>(null);
  const [pregnancyForm, setPregnancyForm] = useState({
    useDueDate: true,
    dueDate: "",
    lastMenstrualPeriod: "",
    notes: "",
  });
  const [pregnancyLogs, setPregnancyLogs] = useState<any[]>([]);
  const [pregnancyLogForm, setPregnancyLogForm] = useState({
    date: "",
    weight: "",
    systolic: "",
    diastolic: "",
    doctorVisit: false,
    supplements: "",
    mood: "",
    symptoms: [] as string[],
  });

  useEffect(() => {
    // Load cycle predictions + history
    api
      .get("/womens-health/predictions")
      .then((r) => {
        const p = r.data.predictions;
        if (p) {
          setPredictions({
            nextPeriod: p.nextPeriod,
            ovulation: p.ovulationDay,
            fertileStart: p.fertileStart,
            fertileEnd: p.fertileEnd,
          });
        }
      })
      .catch(() => {});

    api
      .get("/womens-health")
      .then((r) => setCycles(r.data || []))
      .catch(() => {});

    // Load pregnancy profile + logs
    api
      .get("/womens-health/pregnancy")
      .then((r) => {
        setPregnancyMode(!!r.data.pregnancyMode);
        setPregnancyProfile(r.data.profile);
        setPregnancyDerived(r.data.derived);
        if (r.data.profile) {
          setPregnancyForm((prev) => ({
            ...prev,
            dueDate: r.data.profile.dueDate ? r.data.profile.dueDate.slice(0, 10) : "",
            lastMenstrualPeriod: r.data.profile.lastMenstrualPeriod
              ? r.data.profile.lastMenstrualPeriod.slice(0, 10)
              : "",
            notes: r.data.profile.notes || "",
          }));
        }
      })
      .catch(() => {});

    api
      .get("/womens-health/pregnancy/logs")
      .then((r) => setPregnancyLogs(r.data || []))
      .catch(() => {});
  }, []);

  const fmt = (d: string | Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const daysUntil = (d: string | Date | null | undefined) =>
    d ? Math.max(0, Math.round((new Date(d).getTime() - Date.now()) / 86400000)) : null;

  const togglePeriodSymptom = (s: string) =>
    setCycleForm((p) => ({
      ...p,
      symptoms: p.symptoms.includes(s) ? p.symptoms.filter((x) => x !== s) : [...p.symptoms, s],
    }));

  const togglePregnancySymptom = (s: string) =>
    setPregnancyLogForm((p) => ({
      ...p,
      symptoms: p.symptoms.includes(s) ? p.symptoms.filter((x) => x !== s) : [...p.symptoms, s],
    }));

  const submitCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        lastPeriodDate: cycleForm.lastPeriodDate,
        cycleLength: +cycleForm.cycleLength,
        periodDuration: +cycleForm.periodDuration,
        flowIntensity: cycleForm.flowIntensity,
        symptoms: cycleForm.symptoms,
        mood: cycleForm.mood || undefined,
      };
      if (cycleForm.periodEndDate) payload.periodEndDate = cycleForm.periodEndDate;
      const { data } = await api.post("/womens-health", payload);
      const p = data.predictions;
      if (p)
        setPredictions({
          nextPeriod: p.nextPeriod,
          ovulation: p.ovulationDay,
          fertileStart: p.fertileStart,
          fertileEnd: p.fertileEnd,
        });
      setCycles((prev) => [data.cycle, ...prev]);
      setCycleForm({
        lastPeriodDate: "",
        periodEndDate: "",
        cycleLength: "28",
        periodDuration: "5",
        flowIntensity: "moderate",
        symptoms: [],
        mood: "",
      });
    } catch {
      // ignore for now
    }
  };

  const handlePregnancySave = async () => {
    try {
      const body: any = {
        pregnancyMode,
        notes: pregnancyForm.notes,
      };
      if (pregnancyForm.useDueDate && pregnancyForm.dueDate) body.dueDate = pregnancyForm.dueDate;
      if (!pregnancyForm.useDueDate && pregnancyForm.lastMenstrualPeriod)
        body.lastMenstrualPeriod = pregnancyForm.lastMenstrualPeriod;

      const { data } = await api.post("/womens-health/pregnancy", body);
      setPregnancyMode(!!data.pregnancyMode);
      setPregnancyProfile(data.profile);
      setPregnancyDerived(data.derived);
    } catch {
      // ignore
    }
  };

  const submitPregnancyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = {
        date: pregnancyLogForm.date || undefined,
        weight: pregnancyLogForm.weight ? Number(pregnancyLogForm.weight) : undefined,
        systolic: pregnancyLogForm.systolic ? Number(pregnancyLogForm.systolic) : undefined,
        diastolic: pregnancyLogForm.diastolic ? Number(pregnancyLogForm.diastolic) : undefined,
        doctorVisit: pregnancyLogForm.doctorVisit,
        supplements: pregnancyLogForm.supplements || undefined,
        mood: pregnancyLogForm.mood || undefined,
        symptoms: pregnancyLogForm.symptoms,
      };
      const { data } = await api.post("/womens-health/pregnancy/logs", body);
      setPregnancyLogs((prev) => [data, ...prev]);
      setPregnancyLogForm({
        date: "",
        weight: "",
        systolic: "",
        diastolic: "",
        doctorVisit: false,
        supplements: "",
        mood: "",
        symptoms: [],
      });
    } catch {
      // ignore
    }
  };

  const symptomChartData = useMemo(() => {
    if (!cycles.length) return [];
    const map: Record<string, number> = {};
    cycles.forEach((c) => {
      (c.symptoms || []).forEach((s: string) => {
        map[s] = (map[s] || 0) + 1;
      });
    });
    return Object.keys(map).map((k) => ({ symptom: k, count: map[k] }));
  }, [cycles]);

  const moodTrendData = useMemo(() => {
    if (!cycles.length) return [];
    const order = ["happy", "energetic", "tired", "stressed", "anxious"];
    return cycles
      .slice()
      .reverse()
      .map((c) => ({
        date: new Date(c.lastPeriodDate).toLocaleDateString("en", { month: "short", day: "numeric" }),
        moodScore: c.mood ? order.indexOf(c.mood) + 1 : 0,
        moodLabel: c.mood || "not logged",
      }));
  }, [cycles]);

  const pregnancyProgressData = useMemo(() => {
    if (!pregnancyLogs.length) return [];
    return pregnancyLogs
      .slice()
      .reverse()
      .map((l) => ({
        date: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        weight: l.weight || null,
        systolic: l.systolic || null,
        diastolic: l.diastolic || null,
      }));
  }, [pregnancyLogs]);

  return (
    <AppLayout title="Women's Health">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top tabs */}
        <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-xl w-fit">
          {([
            { key: "cycle", label: "Cycle & Mood" },
            { key: "pregnancy", label: "Pregnancy" },
            { key: "education", label: "Guides & Nutrition" },
          ] as { key: TabKey; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "cycle" && (
          <div className="space-y-6">
            {/* Summary cards */}
            {predictions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Next Period",
                    date: predictions.nextPeriod,
                    days: daysUntil(predictions.nextPeriod),
                    color: "text-rose-500",
                  },
                  {
                    label: "Ovulation",
                    date: predictions.ovulation,
                    days: daysUntil(predictions.ovulation),
                    color: "text-purple-500",
                  },
                  {
                    label: "Fertile Window",
                    date: `${fmt(predictions.fertileStart)} – ${fmt(predictions.fertileEnd)}`,
                    color: "text-primary",
                  },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{p.label}</p>
                    </div>
                    <p className={`font-bold text-lg ${p.color}`}>{typeof p.date === "string" && p.date.includes("–") ? p.date : fmt(p.date as any)}</p>
                    {"days" in p && p.days !== null && p.days !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        In {p.days} day{p.days !== 1 ? "s" : ""}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Calendar + charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PageCard title="Cycle Calendar" subtitle="Upcoming phases">
                <CycleCalendar predictions={predictions} />
              </PageCard>
              <PageCard title="Symptom History" subtitle="Across recent cycles">
                {symptomChartData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={symptomChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="symptom" fontSize={11} />
                      <YAxis allowDecimals={false} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(341, 75%, 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Log cycles with symptoms to see patterns here.</p>
                )}
              </PageCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PageCard title="Mood Trend" subtitle="How you felt around your cycle">
                {moodTrendData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis hide domain={[0, 6]} />
                      <Tooltip
                        formatter={(_, __, item: any) => item.payload.moodLabel}
                        labelFormatter={(l) => `Date: ${l}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="moodScore"
                        stroke="hsl(241, 80%, 60%)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "hsl(241, 80%, 60%)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Add mood when logging cycles to see trends.</p>
                )}
              </PageCard>

              {/* Log cycle form */}
              <PageCard title="Log Cycle & Mood" subtitle="Track your period, symptoms, and mood">
                <form onSubmit={submitCycle} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Period Start *</Label>
                      <Input
                        type="date"
                        value={cycleForm.lastPeriodDate}
                        onChange={(e) => setCycleForm((p) => ({ ...p, lastPeriodDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Period End</Label>
                      <Input
                        type="date"
                        value={cycleForm.periodEndDate}
                        onChange={(e) => setCycleForm((p) => ({ ...p, periodEndDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Cycle Length (days)</Label>
                      <Input
                        type="number"
                        value={cycleForm.cycleLength}
                        onChange={(e) => setCycleForm((p) => ({ ...p, cycleLength: e.target.value }))}
                        min={21}
                        max={45}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Period Duration (days)</Label>
                      <Input
                        type="number"
                        value={cycleForm.periodDuration}
                        onChange={(e) => setCycleForm((p) => ({ ...p, periodDuration: e.target.value }))}
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Flow Intensity</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={cycleForm.flowIntensity}
                        onChange={(e) => setCycleForm((p) => ({ ...p, flowIntensity: e.target.value }))}
                      >
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mood Today</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={cycleForm.mood}
                        onChange={(e) => setCycleForm((p) => ({ ...p, mood: e.target.value }))}
                      >
                        <option value="">Not logged</option>
                        {MOODS.map((m) => (
                          <option key={m} value={m}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label className="text-xs mb-2 block">Period Symptoms</Label>
                    <div className="flex flex-wrap gap-2">
                      {PERIOD_SYMPTOMS.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => togglePeriodSymptom(s)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            cycleForm.symptoms.includes(s)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="mt-2">
                    Save Cycle
                  </Button>
                </form>
              </PageCard>
            </div>
          </div>
        )}

        {tab === "pregnancy" && (
          <div className="space-y-6">
            {/* Pregnancy dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PageCard
                title="Pregnancy Mode"
                subtitle="Toggle to enable pregnancy tracking"
                action={
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{pregnancyMode ? "On" : "Off"}</span>
                    <button
                      type="button"
                      onClick={() => setPregnancyMode((v) => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pregnancyMode ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pregnancyMode ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                }
              >
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Baby className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track pregnancy week, weight, appointments, and symptoms in one place.
                  </p>
                </div>
              </PageCard>

              <PageCard title="Current Week" subtitle="Based on your dates">
                {pregnancyMode && pregnancyDerived ? (
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{pregnancyDerived.week}</p>
                    <p className="text-xs text-muted-foreground">Pregnancy week</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Month {pregnancyDerived.month} • {pregnancyDerived.trimester}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Enable pregnancy mode and add dates to see progress.</p>
                )}
              </PageCard>

              <PageCard title="Key Dates">
                <div className="space-y-1 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">LMP</span>
                    <span className="font-medium">
                      {pregnancyProfile?.lastMenstrualPeriod ? fmt(pregnancyProfile.lastMenstrualPeriod) : "—"}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">
                      {pregnancyProfile?.dueDate ? fmt(pregnancyProfile.dueDate) : "—"}
                    </span>
                  </p>
                  {pregnancyDerived?.dueDate && (
                    <p className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Days until due date</span>
                      <span className="font-semibold">
                        {daysUntil(pregnancyDerived.dueDate)} day
                        {daysUntil(pregnancyDerived.dueDate) === 1 ? "" : "s"}
                      </span>
                    </p>
                  )}
                </div>
              </PageCard>
            </div>

            {/* Pregnancy details + logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PageCard title="Pregnancy Details" subtitle="Set due date or last menstrual period">
                <div className="space-y-4">
                  <div className="flex gap-2 text-xs bg-muted rounded-lg p-2 w-fit">
                    <button
                      type="button"
                      onClick={() => setPregnancyForm((p) => ({ ...p, useDueDate: true }))}
                      className={`px-3 py-1 rounded-md ${
                        pregnancyForm.useDueDate ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Use due date
                    </button>
                    <button
                      type="button"
                      onClick={() => setPregnancyForm((p) => ({ ...p, useDueDate: false }))}
                      className={`px-3 py-1 rounded-md ${
                        !pregnancyForm.useDueDate ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Use last period
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Expected Due Date{pregnancyForm.useDueDate ? " *" : ""}
                      </Label>
                      <Input
                        type="date"
                        value={pregnancyForm.dueDate}
                        onChange={(e) => setPregnancyForm((p) => ({ ...p, dueDate: e.target.value }))}
                        disabled={!pregnancyForm.useDueDate}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Last Menstrual Period{!pregnancyForm.useDueDate ? " *" : ""}
                      </Label>
                      <Input
                        type="date"
                        value={pregnancyForm.lastMenstrualPeriod}
                        onChange={(e) => setPregnancyForm((p) => ({ ...p, lastMenstrualPeriod: e.target.value }))}
                        disabled={pregnancyForm.useDueDate}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Notes (optional)</Label>
                    <Input
                      value={pregnancyForm.notes}
                      onChange={(e) => setPregnancyForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Anything you want to remember..."
                    />
                  </div>

                  <Button type="button" onClick={handlePregnancySave}>
                    Save Pregnancy Info
                  </Button>
                </div>
              </PageCard>

              <PageCard
                title="Pregnancy Tracking"
                subtitle="Weight, blood pressure, visits, and supplements"
              >
                <form onSubmit={submitPregnancyLog} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={pregnancyLogForm.date}
                        onChange={(e) => setPregnancyLogForm((p) => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input
                        type="number"
                        value={pregnancyLogForm.weight}
                        onChange={(e) => setPregnancyLogForm((p) => ({ ...p, weight: e.target.value }))}
                        placeholder="e.g. 62.5"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Systolic (upper)</Label>
                      <Input
                        type="number"
                        value={pregnancyLogForm.systolic}
                        onChange={(e) => setPregnancyLogForm((p) => ({ ...p, systolic: e.target.value }))}
                        placeholder="e.g. 110"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Diastolic (lower)</Label>
                      <Input
                        type="number"
                        value={pregnancyLogForm.diastolic}
                        onChange={(e) => setPregnancyLogForm((p) => ({ ...p, diastolic: e.target.value }))}
                        placeholder="e.g. 70"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mood</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={pregnancyLogForm.mood}
                        onChange={(e) => setPregnancyLogForm((p) => ({ ...p, mood: e.target.value }))}
                      >
                        <option value="">Not logged</option>
                        {MOODS.map((m) => (
                          <option key={m} value={m}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Doctor Visit Today?</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input text-primary"
                          checked={pregnancyLogForm.doctorVisit}
                          onChange={(e) =>
                            setPregnancyLogForm((p) => ({ ...p, doctorVisit: e.target.checked }))
                          }
                        />
                        <span className="text-xs text-muted-foreground">Checked by doctor</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Supplements / Medications</Label>
                    <Input
                      value={pregnancyLogForm.supplements}
                      onChange={(e) => setPregnancyLogForm((p) => ({ ...p, supplements: e.target.value }))}
                      placeholder="e.g. prenatal vitamins, iron, folate"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Symptoms</Label>
                    <div className="flex flex-wrap gap-2">
                      {PREGNANCY_SYMPTOMS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => togglePregnancySymptom(s)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            pregnancyLogForm.symptoms.includes(s)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="mt-1">
                    Add Pregnancy Log
                  </Button>
                </form>
              </PageCard>
            </div>

            {/* Pregnancy charts + reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PageCard
                title="Weight & Blood Pressure"
                subtitle="Recent pregnancy check-ins"
                className="lg:col-span-2"
              >
                {pregnancyProgressData.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={pregnancyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis yAxisId="left" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" fontSize={11} />
                      <Tooltip />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        name="Weight (kg)"
                        stroke="hsl(161, 60%, 45%)"
                        fill="hsl(161, 60%, 45%)"
                        fillOpacity={0.16}
                        strokeWidth={2}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="systolic"
                        name="Systolic"
                        stroke="hsl(10, 80%, 60%)"
                        fill="hsl(10, 80%, 60%)"
                        fillOpacity={0.08}
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add pregnancy logs to track weight gain and blood pressure trends.
                  </p>
                )}
              </PageCard>

              <PageCard title="Smart Reminders" subtitle="Daily focus points">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Droplets className="h-4 w-4 text-primary mt-0.5" />
                    <span>Drink 8–10 glasses of water across the day.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-primary mt-0.5" />
                    <span>Light prenatal exercise (walking, stretching) most days, if approved by your doctor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Smile className="h-4 w-4 text-primary mt-0.5" />
                    <span>Schedule or confirm upcoming doctor checkups and ultrasounds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-primary mt-0.5" />
                    <span>Take prescribed supplements (folic acid, iron, calcium, etc.) consistently.</span>
                  </li>
                </ul>
              </PageCard>
            </div>
          </div>
        )}

        {tab === "education" && (
          <div className="space-y-6">
            <PageCard title="Weekly Pregnancy Guide" subtitle="General educational guidance by week">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    {pregnancyDerived?.week ? `Week ${pregnancyDerived.week}` : "Weeks 1–12"}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Early baby development: brain, heart, and spinal cord form.</li>
                    <li>Common symptoms: nausea, fatigue, breast tenderness.</li>
                    <li>Focus on folate, hydration, and adequate rest.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    {pregnancyDerived?.week ? `Around Week ${Math.max(13, pregnancyDerived.week)}` : "Weeks 13–27"}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Baby grows rapidly; you may feel movements ("quickening").</li>
                    <li>Back pain and leg cramps can appear.</li>
                    <li>Maintain gentle exercise and balanced meals.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    {pregnancyDerived?.week ? `Around Week ${Math.max(28, pregnancyDerived.week)}` : "Weeks 28–40"}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Baby gains weight and prepares for birth.</li>
                    <li>Watch for swelling, headaches, or vision changes and report to your doctor.</li>
                    <li>Discuss birth plan and hospital bag essentials.</li>
                  </ul>
                </div>
              </div>
            </PageCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PageCard title="Recommended Foods During Pregnancy">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Iron-rich:</strong> spinach, lentils, beans, lean red meat.
                  </li>
                  <li>
                    <strong className="text-foreground">Calcium:</strong> milk, yogurt, paneer, fortified plant milks.
                  </li>
                  <li>
                    <strong className="text-foreground">Protein:</strong> eggs, tofu, pulses, nuts, seeds, dairy.
                  </li>
                  <li>
                    <strong className="text-foreground">Folate:</strong> leafy greens, citrus fruits, beans, fortified grains.
                  </li>
                  <li>
                    <strong className="text-foreground">Hydration:</strong> water, coconut water, soups, herbal teas (doctor-approved).
                  </li>
                </ul>
              </PageCard>

              <PageCard
                title="Foods & Substances to Avoid"
                action={<AlertTriangle className="h-5 w-5 text-amber-500" />}
              >
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg px-3 py-2 text-xs">
                    Always confirm food safety advice with your obstetrician or midwife.
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Alcohol and recreational drugs.</li>
                    <li>Raw or undercooked seafood, eggs, or meat.</li>
                    <li>Unpasteurized milk, soft cheeses, and juices.</li>
                    <li>High-caffeine intake (coffee/energy drinks).</li>
                    <li>Highly processed or high-sodium packaged foods.</li>
                  </ul>
                </div>
              </PageCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PageCard title="Prenatal Exercise Tips">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Get medical clearance before starting or changing exercise routines.</li>
                  <li>Aim for gentle activities: walking, swimming, prenatal yoga.</li>
                  <li>Avoid lying flat on your back for long in late pregnancy.</li>
                  <li>Stop immediately if you feel dizziness, pain, or shortness of breath.</li>
                </ul>
              </PageCard>
              <PageCard title="Sleep & Body Positions">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Sleeping on the left side may improve blood flow to baby.</li>
                  <li>Use pillows between knees and under belly for support.</li>
                  <li>Aim for a calm bedtime routine and screen-free wind-down time.</li>
                </ul>
              </PageCard>
              <PageCard title="Mental Health & Support">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Track mood regularly and notice patterns of anxiety or low mood.</li>
                  <li>Talk to your doctor if you feel persistently sad, hopeless, or overwhelmed.</li>
                  <li>Lean on trusted friends, family, or support groups.</li>
                  <li>Short mindfulness or breathing exercises can help manage stress.</li>
                </ul>
              </PageCard>
            </div>

            <p className="text-xs text-center text-muted-foreground bg-muted rounded-xl p-3">
              Medora provides educational information only and does not replace professional medical care. Always
              consult your healthcare provider for decisions about your menstrual health, fertility, or pregnancy.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function CycleCalendar({ predictions }: { predictions: any }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days: { date: Date; label: number; inMonth: boolean; type?: string }[] = [];

  const firstWeekday = start.getDay();
  for (let i = 0; i < firstWeekday; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - (firstWeekday - i));
    days.push({ date: d, label: d.getDate(), inMonth: false });
  }
  for (let d = 1; d <= end.getDate(); d++) {
    days.push({ date: new Date(year, month, d), label: d, inMonth: true });
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    days.push({ date: d, label: d.getDate(), inMonth: false });
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const fertileRange =
    predictions && predictions.fertileStart && predictions.fertileEnd
      ? {
          start: new Date(predictions.fertileStart),
          end: new Date(predictions.fertileEnd),
        }
      : null;

  const ovulationDate = predictions?.ovulation ? new Date(predictions.ovulation) : null;
  const nextPeriodDate = predictions?.nextPeriod ? new Date(predictions.nextPeriod) : null;

  const enhancedDays = days.map((d) => {
    let type: string | undefined;
    if (nextPeriodDate && isSameDay(d.date, nextPeriodDate)) type = "period";
    else if (ovulationDate && isSameDay(d.date, ovulationDate)) type = "ovulation";
    else if (
      fertileRange &&
      d.date >= new Date(fertileRange.start.getFullYear(), fertileRange.start.getMonth(), fertileRange.start.getDate()) &&
      d.date <= new Date(fertileRange.end.getFullYear(), fertileRange.end.getMonth(), fertileRange.end.getDate())
    )
      type = "fertile";
    return { ...d, type };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
        <span>
          {today.toLocaleDateString("en", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Period
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400" /> Ovulation
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Fertile
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs mb-1 text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {enhancedDays.map((d, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-lg flex items-center justify-center border border-transparent ${
              d.inMonth ? "text-foreground" : "text-muted-foreground/40"
            } ${
              d.type === "period"
                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                : d.type === "ovulation"
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : d.type === "fertile"
                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                : "hover:bg-muted"
            }`}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WomensHealth;
