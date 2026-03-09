import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Syringe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";

const empty = { vaccineName: "", dateTaken: "", nextDose: "", notes: "" };

const VaccinationTracker = () => {
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { api.get("/vaccinations").then(r => setVaccinations(r.data)).catch(() => {}); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await api.put(`/vaccinations/${editing}`, form);
        setVaccinations(v => v.map(x => x._id === editing ? data : x));
        setEditing(null);
      } else {
        const { data } = await api.post("/vaccinations", form);
        setVaccinations(v => [data, ...v]);
      }
      setForm(empty); setShowForm(false);
    } catch {}
  };

  const remove = async (id: string) => {
    await api.delete(`/vaccinations/${id}`);
    setVaccinations(v => v.filter(x => x._id !== id));
  };

  const isDue = (nextDose: string) => nextDose && new Date(nextDose) <= new Date(Date.now() + 30 * 86400000);

  return (
    <AppLayout title="Vaccination Tracker">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{vaccinations.length} vaccine{vaccinations.length !== 1 ? "s" : ""} recorded</p>
          <Button onClick={() => { setShowForm(!showForm); setForm(empty); setEditing(null); }}>
            <Plus className="h-4 w-4 mr-2" />Add Vaccine
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <PageCard title={editing ? "Edit Vaccination" : "Add Vaccination Record"}>
                <form onSubmit={submit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label>Vaccine Name *</Label>
                      <Input value={form.vaccineName} onChange={set("vaccineName")} placeholder="e.g. COVID-19, Flu, Hepatitis B" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date Taken</Label>
                      <Input type="date" value={form.dateTaken} onChange={set("dateTaken")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Next Dose Due</Label>
                      <Input type="date" value={form.nextDose} onChange={set("nextDose")} />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label>Notes</Label>
                      <Input value={form.notes} onChange={set("notes")} placeholder="e.g. Dose 1 of 2, side effects..." />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button type="submit">{editing ? "Update" : "Save Record"}</Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(empty); setEditing(null); }}>Cancel</Button>
                  </div>
                </form>
              </PageCard>
            </motion.div>
          )}
        </AnimatePresence>

        <PageCard title="Vaccination Records">
          {vaccinations.length === 0 ? (
            <div className="text-center py-10">
              <Syringe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No vaccination records yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vaccinations.map(vac => (
                <motion.div key={vac._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl border ${isDue(vac.nextDose) ? "border-amber-300 bg-amber-50 dark:bg-amber-900/10" : "border-border bg-muted/40"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{vac.vaccineName}</p>
                        {isDue(vac.nextDose) && <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">Due Soon</span>}
                      </div>
                      {vac.dateTaken && <p className="text-xs text-muted-foreground">Taken: {new Date(vac.dateTaken).toLocaleDateString()}</p>}
                      {vac.nextDose && <p className="text-xs text-muted-foreground">Next dose: {new Date(vac.nextDose).toLocaleDateString()}</p>}
                      {vac.notes && <p className="text-xs text-muted-foreground mt-1">{vac.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setForm(vac); setEditing(vac._id); setShowForm(true); }} className="text-muted-foreground hover:text-foreground p-1"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => remove(vac._id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                    </div>
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

export default VaccinationTracker;
