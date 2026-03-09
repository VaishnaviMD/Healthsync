import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Calendar, Info } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";

const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Mood changes", "Back pain", "Nausea", "Breast tenderness"];

const WomensHealth = () => {
  const [predictions, setPredictions] = useState<any>(null);
  const [cycle, setCycle] = useState<any>(null);
  const [form, setForm] = useState({ lastPeriodDate: "", cycleLength: "28", periodDuration: "5", symptoms: [] as string[] });
  const [tab, setTab] = useState<"tracker" | "menopause">("tracker");

  useEffect(() => {
    api.get("/womens-health/predictions").then(r => { setPredictions(r.data.predictions); setCycle(r.data.latest); }).catch(() => {});
  }, []);

  const toggleSymptom = (s: string) => setForm(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/womens-health", { ...form, cycleLength: +form.cycleLength, periodDuration: +form.periodDuration });
      setPredictions(data.predictions); setCycle(data.cycle);
      setForm({ lastPeriodDate: "", cycleLength: "28", periodDuration: "5", symptoms: [] });
    } catch {}
  };

  const fmt = (d: string | Date) => d ? new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "--";
  const daysUntil = (d: string | Date) => d ? Math.max(0, Math.round((new Date(d).getTime() - Date.now()) / 86400000)) : null;

  return (
    <AppLayout title="Women's Health">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {(["tracker", "menopause"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t === "tracker" ? "Cycle Tracker" : "Menopause Info"}</button>
          ))}
        </div>

        {tab === "tracker" ? (
          <>
            {predictions && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Next Period", date: predictions.nextPeriod, days: daysUntil(predictions.nextPeriod), color: "text-rose-500" },
                  { label: "Ovulation Day", date: predictions.ovulation, days: daysUntil(predictions.ovulation), color: "text-purple-500" },
                  { label: "Fertile Window", date: `${fmt(predictions.fertileStart)} – ${fmt(predictions.fertileEnd)}`, color: "text-primary" },
                ].map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{p.label}</p>
                    </div>
                    <p className={`font-bold text-lg ${p.color}`} style={{ fontFamily: "Syne, sans-serif" }}>{typeof p.date === "string" && p.date.includes("–") ? p.date : fmt(p.date as string)}</p>
                    {p.days !== undefined && p.days !== null && <p className="text-xs text-muted-foreground mt-1">In {p.days} day{p.days !== 1 ? "s" : ""}</p>}
                  </motion.div>
                ))}
              </div>
            )}

            <PageCard title="Log Cycle" subtitle="Enter your last period details for predictions">
              <form onSubmit={submit}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Period Date *</Label>
                    <Input type="date" value={form.lastPeriodDate} onChange={e => setForm(p => ({ ...p, lastPeriodDate: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cycle Length (days)</Label>
                    <Input type="number" value={form.cycleLength} onChange={e => setForm(p => ({ ...p, cycleLength: e.target.value }))} min="21" max="45" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Period Duration (days)</Label>
                    <Input type="number" value={form.periodDuration} onChange={e => setForm(p => ({ ...p, periodDuration: e.target.value }))} min="1" max="10" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-xs mb-2 block">Symptoms (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map(s => (
                      <button type="button" key={s} onClick={() => toggleSymptom(s)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${form.symptoms.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="mt-4">Save & Get Predictions</Button>
              </form>
            </PageCard>
          </>
        ) : (
          <div className="space-y-4">
            <PageCard title="What is Menopause?" action={<Info className="h-5 w-5 text-primary" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">Menopause is a natural biological process marking the end of menstrual cycles. It's diagnosed after 12 consecutive months without a menstrual period. Menopause typically occurs in a woman's late 40s to early 50s — the average age is 51.</p>
            </PageCard>

            {[
              { title: "Common Symptoms", icon: "🌡️", items: ["Hot flashes and night sweats", "Irregular periods (perimenopause)", "Vaginal dryness", "Sleep problems and insomnia", "Mood changes and irritability", "Weight changes", "Thinning hair", "Brain fog and memory changes"] },
              { title: "Stages", icon: "📅", items: ["Perimenopause (several years before menopause)", "Menopause (12 months after last period, typically 45–55)", "Postmenopause (years after menopause)"] },
              { title: "Wellness Tips", icon: "💚", items: ["Regular exercise (walking, yoga, strength training)", "Balanced diet rich in calcium and vitamin D", "Limit alcohol and caffeine", "Stress management and mindfulness", "Regular health check-ups", "Talk to your doctor about HRT options"] },
            ].map(section => (
              <PageCard key={section.title} title={`${section.icon} ${section.title}`}>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">•</span>{item}
                    </li>
                  ))}
                </ul>
              </PageCard>
            ))}

            <p className="text-xs text-center text-muted-foreground bg-muted rounded-xl p-3">
              This information is educational only. Consult your healthcare provider for personalized guidance about menopause management.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WomensHealth;
