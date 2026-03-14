import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Trash2,
  Check,
  Clock,
  Pencil,
  Pill,
  AlertTriangle,
  Bell,
  Package,
  History,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { medicineAPI, interactionAPI } from '@/services/api';
import { useMedicineReminderContext } from '@/context/MedicineReminderContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'four_times_daily', label: 'Four times daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
];

const DEFAULT_TIMES: Record<string, string[]> = {
  once_daily: ['08:00'],
  twice_daily: ['08:00', '20:00'],
  three_times_daily: ['08:00', '14:00', '20:00'],
  four_times_daily: ['08:00', '12:00', '16:00', '20:00'],
  weekly: ['08:00'],
  as_needed: [],
};

function formatTime24ToDisplay(t: string) {
  if (!t) return '8:00 AM';
  const [h, m] = t.split(':').map(Number);
  const am = h < 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

function parseDisplayTo24(t: string) {
  const s = t.trim().toUpperCase();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return t.replace(/\s/g, '');
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = (m[3] || '').toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

interface Medicine {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  times?: string[];
  time?: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  foodRestrictions?: string;
  tabletsRemaining?: number | null;
  lowStockThreshold?: number;
  notes?: string;
  reminderEnabled?: boolean;
}

const emptyForm = {
  name: '',
  dosage: '',
  frequency: 'once_daily' as const,
  time: '8:00 AM',
  times: ['08:00'] as string[],
  startDate: '',
  endDate: '',
  instructions: '',
  foodRestrictions: '',
  tabletsRemaining: '',
  lowStockThreshold: '5',
  notes: '',
  reminderEnabled: true,
};

const MedicineManager = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [adherence, setAdherence] = useState({ taken: 0, total: 0, adherencePercent: 0 });
  const [adherenceChart, setAdherenceChart] = useState<any[]>([]);
  const [missedDoses, setMissedDoses] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<{ date: string; entries: any[] } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [interactionCheck, setInteractionCheck] = useState<any>(null);
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  const reminderCtx = useMedicineReminderContext();
  const upcoming = reminderCtx?.upcoming ?? [];
  const notificationPermission = reminderCtx?.notificationPermission ?? 'default';
  const requestNotificationPermission = reminderCtx?.requestNotificationPermission ?? (async () => 'denied');
  const loadReminders = reminderCtx?.loadReminders ?? (async () => {});

  const load = useCallback(async () => {
    try {
      const [medsRes, adhRes, chartRes, missedRes, lowRes, histRes] = await Promise.all([
        medicineAPI.getAll(),
        medicineAPI.getAdherence(),
        medicineAPI.getAdherenceChart(7),
        medicineAPI.getMissedDoses(),
        medicineAPI.getLowStock(),
        medicineAPI.getHistory(),
      ]);
      setMedicines(medsRes.data || []);
      setAdherence(adhRes.data || { taken: 0, total: 0, adherencePercent: 0 });
      setAdherenceChart(chartRes.data || []);
      setMissedDoses(missedRes.data || []);
      setLowStock(lowRes.data || []);
      setHistory(histRes.data || null);
      loadReminders();
    } catch {
      toast.error('Failed to load medicines');
    } finally {
      setInitialLoad(false);
    }
  }, [loadReminders]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === 'frequency') {
        next.times = DEFAULT_TIMES[value] || ['08:00'];
        next.time = formatTime24ToDisplay(next.times[0] || '08:00');
      }
      return next;
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    setForm((p) => {
      const next = { ...p };
      const parsed = parseDisplayTo24(value);
      next.times = [...(p.times || [])];
      next.times[index] = parsed;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency,
        times: form.times?.filter(Boolean) || [parseDisplayTo24(form.time || '08:00')],
        instructions: form.instructions || undefined,
        foodRestrictions: form.foodRestrictions || undefined,
        notes: form.notes || undefined,
        reminderEnabled: form.reminderEnabled,
      };
      if (form.startDate) payload.startDate = form.startDate;
      if (form.endDate) payload.endDate = form.endDate;
      if (form.tabletsRemaining !== '') payload.tabletsRemaining = parseInt(form.tabletsRemaining, 10) || null;
      if (form.lowStockThreshold) payload.lowStockThreshold = parseInt(form.lowStockThreshold, 10) || 5;

      if (editing) {
        await medicineAPI.update(editing, payload);
        toast.success('Medicine updated');
      } else {
        await medicineAPI.add(payload);
        toast.success('Medicine added – reminders created');
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditing(null);
      setInteractionCheck(null);
      load();
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const markTaken = async (med: Medicine, scheduledDate?: string, scheduledTime?: string) => {
    try {
      const date = scheduledDate || new Date().toISOString().slice(0, 10);
      const times = med.times && med.times.length > 0 ? med.times : [med.time ? parseDisplayTo24(med.time as string) : '08:00'];
      const time = scheduledTime || times[0];
      await medicineAPI.markTaken({
        medicineId: med._id,
        scheduledDate: date,
        scheduledTime: time,
      });
      toast.success('Marked as taken');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const markSkipped = async (med: Medicine, scheduledDate?: string, scheduledTime?: string) => {
    try {
      const date = scheduledDate || new Date().toISOString().slice(0, 10);
      const times = med.times && med.times.length > 0 ? med.times : [med.time ? parseDisplayTo24(med.time as string) : '08:00'];
      const time = scheduledTime || times[0];
      await medicineAPI.markSkipped({
        medicineId: med._id,
        scheduledDate: date,
        scheduledTime: time,
      });
      toast.success('Dose skipped');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const checkInteraction = async () => {
    if (!form.name?.trim()) {
      toast.error('Enter medicine name first');
      return;
    }
    setCheckingInteraction(true);
    try {
      const r = await interactionAPI.check(form.name);
      setInteractionCheck(r.data);
    } catch {
      setInteractionCheck({ found: false, message: 'Could not check interactions.' });
    } finally {
      setCheckingInteraction(false);
    }
  };

  const startEdit = (med: Medicine) => {
    const times = med.times && med.times.length > 0 ? med.times : (med.time ? [parseDisplayTo24(med.time as string)] : ['08:00']);
    setForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency || 'once_daily',
      time: formatTime24ToDisplay(times[0] || '08:00'),
      times,
      startDate: med.startDate ? med.startDate.toString().slice(0, 10) : '',
      endDate: med.endDate ? med.endDate.toString().slice(0, 10) : '',
      instructions: med.instructions || '',
      foodRestrictions: med.foodRestrictions || '',
      tabletsRemaining: med.tabletsRemaining != null ? String(med.tabletsRemaining) : '',
      lowStockThreshold: String(med.lowStockThreshold ?? 5),
      notes: med.notes || '',
      reminderEnabled: med.reminderEnabled !== false,
    });
    setEditing(med._id);
    setShowForm(true);
    setInteractionCheck(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await medicineAPI.delete(deleteId);
      toast.success('Medicine removed');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const adherencePct = adherence.adherencePercent ?? (adherence.total > 0 ? Math.round((adherence.taken / adherence.total) * 100) : 0);

  if (initialLoad) {
    return (
      <AppLayout title="Medicines">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Medicines">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Notification permission */}
        {notificationPermission !== 'granted' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Enable browser notifications</p>
                <p className="text-sm text-muted-foreground">Get reminders even when the app is in the background</p>
              </div>
            </div>
            <Button size="sm" onClick={() => requestNotificationPermission()}>
              Enable
            </Button>
          </motion.div>
        )}

        {/* Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PageCard className="flex flex-row items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(158, 64%, 45%)" strokeWidth="2.5" strokeDasharray={`${adherencePct}, 100`} strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">{adherencePct}%</span>
                <span className="text-xs text-muted-foreground">Adherence</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s doses</p>
              <p className="text-2xl font-bold text-foreground">{adherence.taken} / {adherence.total || '–'}</p>
            </div>
          </PageCard>
          <PageCard>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-xl font-bold text-foreground">{upcoming.length} reminders</p>
              </div>
            </div>
          </PageCard>
          <PageCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medicines</p>
                  <p className="text-xl font-bold text-foreground">{medicines.length}</p>
                </div>
              </div>
              <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); setInteractionCheck(null); }}>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </PageCard>
        </div>

        {/* Alerts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {missedDoses.length > 0 && (
            <PageCard title="Missed dose alerts" className="border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
              {missedDoses.map((m: any) => (
                <div key={`${m.medicineId}-${m.scheduledTime}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span className="text-sm">You missed <strong>{m.medicineName}</strong> at {m.displayTime}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => markTaken(medicines.find((x) => x._id === m.medicineId)!, new Date().toISOString().slice(0, 10), m.scheduledTime)}>
                    Mark taken
                  </Button>
                </div>
              ))}
            </PageCard>
          )}
          {lowStock.length > 0 && (
            <PageCard title="Refill alerts" className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
              {lowStock.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-sm">Only <strong>{m.tabletsRemaining}</strong> {m.name} remaining. Refill soon.</span>
                  </div>
                </div>
              ))}
            </PageCard>
          )}
        </div>

        {/* Upcoming reminders + Adherence chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PageCard title="Upcoming reminders" subtitle="Next doses to take">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No upcoming reminders for today</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((r) => (
                  <div key={`${r.medicineId}-${r.scheduledTime}`} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{r.medicineName} – {r.dosage}</p>
                      <p className="text-sm text-muted-foreground">{r.displayTime}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => markTaken(medicines.find((x) => x._id === r.medicineId)!, r.scheduledDate, r.scheduledTime)}>
                        <Check className="h-4 w-4 mr-1" /> Taken
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => markSkipped(medicines.find((x) => x._id === r.medicineId)!, r.scheduledDate, r.scheduledTime)}>
                        Skip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageCard>

          <PageCard title="Adherence trend" subtitle="Last 7 days">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adherenceChart.length ? adherenceChart : [{ label: 'No data', adherencePercent: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="adherencePercent" fill="hsl(158, 64%, 40%)" radius={[4, 4, 0, 0]} name="Adherence %" />
              </BarChart>
            </ResponsiveContainer>
          </PageCard>
        </div>

        {/* Medicine history */}
        {history && history.entries && history.entries.length > 0 && (
          <PageCard title="Today's log" subtitle={history.date}>
            <div className="space-y-2">
              {history.entries.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{e.medicineName} – {e.dosage} ({e.displayTime})</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    e.status === 'taken' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    e.status === 'missed' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
                    e.status === 'skipped' && 'bg-muted text-muted-foreground'
                  )}>{e.status}</span>
                </div>
              ))}
            </div>
          </PageCard>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <PageCard title={editing ? 'Edit medicine' : 'Add new medicine'} className="rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Medicine name</Label>
                  <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Paracetamol" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select name="frequency" value={form.frequency} onChange={handleChange}>
                    {FREQUENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </div>
                {form.frequency !== 'as_needed' && (
                  <div className="space-y-2">
                    <Label>Times (e.g. 8:00 AM, 2:00 PM)</Label>
                    <div className="flex flex-wrap gap-2">
                      {(form.times || ['08:00']).map((t, i) => (
                        <Input
                          key={i}
                          value={formatTime24ToDisplay(t)}
                          onChange={(e) => handleTimeChange(i, e.target.value)}
                          placeholder="8:00 AM"
                          className="w-28 rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Instructions</Label>
                  <Input name="instructions" value={form.instructions} onChange={handleChange} placeholder="e.g. Take with food" className="rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Food restrictions</Label>
                  <Input name="foodRestrictions" value={form.foodRestrictions} onChange={handleChange} placeholder="e.g. Avoid alcohol, take on empty stomach" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Tablets remaining</Label>
                  <Input name="tabletsRemaining" type="number" min="0" value={form.tabletsRemaining} onChange={handleChange} placeholder="e.g. 20" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Low stock alert at</Label>
                  <Input name="lowStockThreshold" type="number" min="1" value={form.lowStockThreshold} onChange={handleChange} placeholder="5" className="rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Notes</Label>
                  <Input name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." className="rounded-xl" />
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" id="reminderEnabled" checked={form.reminderEnabled} onChange={(e) => setForm((p) => ({ ...p, reminderEnabled: e.target.checked }))} className="rounded" />
                  <Label htmlFor="reminderEnabled">Enable reminders</Label>
                </div>
              </div>

              {/* Medicine-food interaction check */}
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={checkInteraction} disabled={checkingInteraction || !form.name.trim()}>
                  <AlertTriangle className="h-4 w-4 mr-2" /> {checkingInteraction ? 'Checking...' : 'Check food interactions'}
                </Button>
              </div>
              {interactionCheck && (
                <div className={cn(
                  'rounded-xl border p-4',
                  interactionCheck.found ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20' : 'border-border bg-muted/30'
                )}>
                  {interactionCheck.found ? (
                    <>
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">Food interactions for {interactionCheck.medicine}</p>
                      <div className="space-y-2 text-sm">
                        {interactionCheck.avoid?.length > 0 && (
                          <p><span className="text-rose-600 dark:text-rose-400 font-medium">Avoid:</span> {interactionCheck.avoid.join(', ')}</p>
                        )}
                        {interactionCheck.recommended?.length > 0 && (
                          <p><span className="text-emerald-600 dark:text-emerald-400 font-medium">Recommended:</span> {interactionCheck.recommended.join(', ')}</p>
                        )}
                        {interactionCheck.message && <p className="text-muted-foreground">{interactionCheck.message}</p>}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{interactionCheck.message}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add medicine'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setInteractionCheck(null); }}>Cancel</Button>
              </div>
            </form>
          </PageCard>
        )}

        {/* Medicine list */}
        <PageCard title="My medicines" subtitle="Your full schedule">
          {medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Pill className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No medicines added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first medicine to get smart reminders and track adherence</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add medicine</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map((med) => {
                const times = med.times && med.times.length > 0 ? med.times : (med.time ? [parseDisplayTo24(med.time as string)] : ['08:00']);
                const displayTimes = times.map(formatTime24ToDisplay).join(', ');
                const isLowStock = med.tabletsRemaining != null && med.tabletsRemaining <= (med.lowStockThreshold ?? 5);
                return (
                  <motion.div
                    key={med._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => markTaken(med)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
                          title="Mark as taken"
                        >
                          <Check className="h-5 w-5 text-primary" />
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{med.name}</p>
                          {isLowStock && (
                            <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-xs font-medium">
                              Low stock
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{med.dosage} • {displayTimes}</p>
                        {med.tabletsRemaining != null && (
                          <p className="text-xs text-muted-foreground mt-0.5">{med.tabletsRemaining} tablets remaining</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(med)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(med._id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </PageCard>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove medicine?"
        description="This will also delete all associated dose records."
        confirmText="Remove"
        variant="danger"
      />
    </AppLayout>
  );
};

export default MedicineManager;
