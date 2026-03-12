import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Phone, AlertTriangle, Pill, Heart } from 'lucide-react';
import { authAPI } from '@/services/api';

const EmergencyCard = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: '',
    emergencyContact: '',
  });

  useEffect(() => {
    if (user) setForm({ bloodGroup: (user as any)?.bloodGroup || '', emergencyContact: (user as any)?.emergencyContact || '' });
  }, [user]);

  const handleSave = async () => {
    try {
      await authAPI.updateProfile(form);
      updateUser(form);
      setEditing(false);
    } catch {}
  };

  const allergies = (user as any)?.allergies || [];
  const medications = (user as any)?.medications || [];

  return (
    <AppLayout title="Emergency Health Card">
      <div className="max-w-xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          Keep this information accessible in case of emergency. First responders can use this to provide better care.
        </p>

        <PageCard className="border-2 border-primary/30 bg-card">
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div><Label>Blood Group</Label><Input value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))} placeholder="e.g. O+ or A-" /></div>
                <div><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={e => setForm(p => ({ ...p, emergencyContact: e.target.value }))} placeholder="Name & phone number" /></div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="font-semibold text-foreground">{form.bloodGroup || user?.bloodGroup || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="font-semibold text-foreground">{form.emergencyContact || user?.emergencyContact || 'Not set'}</p>
                  </div>
                </div>
                {allergies.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Allergies</p>
                      <p className="font-semibold text-destructive">{Array.isArray(allergies) ? allergies.join(', ') : allergies}</p>
                    </div>
                  </div>
                )}
                {medications.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Pill className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Medications</p>
                      <p className="font-semibold text-foreground">{Array.isArray(medications) ? medications.join(', ') : medications}</p>
                    </div>
                  </div>
                )}
                <Button variant="outline" onClick={() => setEditing(true)} className="w-full">Edit Emergency Info</Button>
              </>
            )}
          </div>
        </PageCard>

        <p className="text-xs text-muted-foreground text-center">
          💡 Tip: Take a screenshot of this card and save it to your phone for quick access.
        </p>
      </div>
    </AppLayout>
  );
};

export default EmergencyCard;
