import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Check, Clock, Pencil, Pill } from 'lucide-react';
import { medicineAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Medicine {
  _id: string;
  medicineName: string;
  dosage: string;
  time: string;
  duration: string;
  status: 'taken' | 'pending' | 'skipped';
  notes: string;
}

const emptyForm = { medicineName: '', dosage: '', time: '', duration: '', status: 'pending', notes: '' };

const MedicineManager = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [adherence, setAdherence] = useState({ taken: 0, total: 0, adherencePercent: 0 });
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = async () => {
    try {
      const [medsRes, adhRes] = await Promise.all([medicineAPI.getAll(), medicineAPI.getAdherence()]);
      setMedicines(medsRes.data);
      setAdherence(adhRes.data);
    } catch {
      toast.error('Failed to load medicines');
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await medicineAPI.update(editing, form);
        toast.success('Medicine updated');
      } else {
        await medicineAPI.add(form);
        toast.success('Medicine added');
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditing(null);
      load();
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (med: Medicine) => {
    const newStatus = med.status === 'taken' ? 'pending' : 'taken';
    try {
      await medicineAPI.update(med._id, { ...med, status: newStatus });
      toast.success(newStatus === 'taken' ? 'Marked as taken' : 'Marked as pending');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const startEdit = (med: Medicine) => {
    setForm({ medicineName: med.medicineName, dosage: med.dosage, time: med.time, duration: med.duration, status: med.status, notes: med.notes });
    setEditing(med._id);
    setShowForm(true);
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
        <div className="max-w-3xl mx-auto space-y-6">
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
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(158, 64%, 45%)" strokeWidth="2.5" strokeDasharray={`${adherencePct}, 100`} strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{adherencePct}%</span>
                <span className="text-xs text-muted-foreground">Adherence</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today&apos;s doses</p>
              <p className="text-2xl font-bold text-foreground">{adherence.taken} / {adherence.total || '–'}</p>
              <p className="text-xs text-muted-foreground mt-1">Mark medicines as taken when you take them</p>
            </div>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }} size="lg">
            <Plus className="h-4 w-4 mr-2" /> Add Medicine
          </Button>
        </div>

        {showForm && (
          <PageCard title={editing ? 'Edit Medicine' : 'Add New Medicine'} className="rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input name="medicineName" value={form.medicineName} onChange={handleChange} placeholder="e.g. Metformin" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input name="time" value={form.time} onChange={handleChange} placeholder="e.g. 8:00 AM" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 30 days" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." className="rounded-xl" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add Medicine'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </PageCard>
        )}

        <PageCard title="My Medicines" className="rounded-2xl shadow-sm">
          {medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Pill className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No medicines added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click &quot;Add Medicine&quot; to get started</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Medicine</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map((med) => (
                <motion.div key={med._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleStatus(med)}
                      className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all', med.status === 'taken' ? 'bg-primary text-white' : 'border-2 border-border hover:border-primary hover:bg-primary/5')}
                    >
                      {med.status === 'taken' ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <div>
                      <p className={cn('font-semibold', med.status === 'taken' && 'line-through text-muted-foreground')}>{med.medicineName}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.time}{med.duration && ` • ${med.duration}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium',
                      med.status === 'taken' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      med.status === 'skipped' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}>{med.status}</span>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(med)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(med._id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove medicine?"
        description="This action cannot be undone."
        confirmText="Remove"
        variant="danger"
      />
    </AppLayout>
  );
};

export default MedicineManager;
