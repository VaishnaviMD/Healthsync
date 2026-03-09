import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, Check, Clock, Pencil } from 'lucide-react';
import { medicineAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { const r = await medicineAPI.getAll(); setMedicines(r.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await medicineAPI.update(editing, form); setEditing(null); }
      else { await medicineAPI.add(form); }
      setForm(emptyForm); setShowForm(false); load();
    } catch {} finally { setLoading(false); }
  };

  const toggleStatus = async (med: Medicine) => {
    const newStatus = med.status === 'taken' ? 'pending' : 'taken';
    try { await medicineAPI.update(med._id, { ...med, status: newStatus }); load(); } catch {}
  };

  const startEdit = (med: Medicine) => {
    setForm({ medicineName: med.medicineName, dosage: med.dosage, time: med.time, duration: med.duration, status: med.status, notes: med.notes });
    setEditing(med._id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try { await medicineAPI.delete(id); load(); } catch {}
  };

  const takenCount = medicines.filter(m => m.status === 'taken').length;

  return (
    <AppLayout title="Medicines (MedSafe)">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{takenCount}/{medicines.length} medicines taken today</p>
            <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all" style={{ width: medicines.length ? `${(takenCount / medicines.length) * 100}%` : '0%' }} />
            </div>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Medicine
          </Button>
        </div>

        {showForm && (
          <PageCard title={editing ? 'Edit Medicine' : 'Add New Medicine'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input name="medicineName" value={form.medicineName} onChange={handleChange} placeholder="e.g. Metformin" required />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg" required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input name="time" value={form.time} onChange={handleChange} placeholder="e.g. 8:00 AM" required />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 30 days" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" value={form.status} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="taken">Taken</option>
                    <option value="skipped">Skipped</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add Medicine'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </PageCard>
        )}

        <PageCard title="My Medicines">
          {medicines.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No medicines added yet. Click "Add Medicine" to get started.</p>
          ) : (
            <div className="space-y-3">
              {medicines.map((med) => (
                <motion.div key={med._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(med)}
                      className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0', med.status === 'taken' ? 'gradient-primary text-white' : 'border-2 border-border hover:border-primary')}
                    >
                      {med.status === 'taken' ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <div>
                      <p className={cn('font-medium', med.status === 'taken' && 'line-through text-muted-foreground')}>{med.medicineName}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage} • {med.time}{med.duration && ` • ${med.duration}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      med.status === 'taken' ? 'bg-success/15 text-success' :
                      med.status === 'skipped' ? 'bg-destructive/15 text-destructive' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}>{med.status}</span>
                    <button onClick={() => startEdit(med)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(med._id)} className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </PageCard>
      </div>
    </AppLayout>
  );
};

export default MedicineManager;
