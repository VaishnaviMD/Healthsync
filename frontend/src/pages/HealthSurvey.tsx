import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { surveyAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: '👤' },
  { id: 'lifestyle', title: 'Lifestyle', icon: '🏃' },
  { id: 'nutrition', title: 'Nutrition', icon: '🥗' },
  { id: 'medical', title: 'Medical', icon: '💊' },
  { id: 'womens', title: "Women's Health", icon: '🌸' },
  { id: 'goals', title: 'Fitness Goals', icon: '🎯' },
];

const initialForm: Record<string, any> = {
  age: '', gender: '', height: '', weight: '',
  activityLevel: '', exerciseFrequency: '', sleepHours: '', stressLevel: '',
  dietType: '', waterIntake: '', mealsPerDay: '',
  medicalConditions: '', allergies: '', medications: '', bloodPressure: false, diabetes: false,
  menstrualCycleLength: '', periodDuration: '', lastPeriodDate: '', pregnancyStatus: '',
  fitnessGoal: 'general_health',
};

const HealthSurvey = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    surveyAPI.getStatus()
      .then(r => { if (r.data.surveyCompleted) navigate('/profile'); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value) }));
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age) || undefined,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
        sleepHours: Number(form.sleepHours) || undefined,
        waterIntake: Number(form.waterIntake) || undefined,
        mealsPerDay: Number(form.mealsPerDay) || undefined,
        menstrualCycleLength: Number(form.menstrualCycleLength) || undefined,
        periodDuration: Number(form.periodDuration) || undefined,
        medicalConditions: form.medicalConditions ? form.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        allergies: form.allergies ? form.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        medications: form.medications ? form.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        lastPeriodDate: form.lastPeriodDate || undefined,
      };
      await surveyAPI.submit(payload);
      navigate('/profile');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit survey');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-6 gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Health Survey</h1>
        <p className="text-muted-foreground mb-6">Step {step + 1} of {STEPS.length}: {currentStep.title}</p>

        <AnimatePresence mode="wait">
          {currentStep.id === 'personal' && (
            <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Age</Label><Input name="age" type="number" value={form.age} onChange={handleChange} placeholder="25" /></div>
                <div><Label>Gender</Label><Select name="gender" value={form.gender} onChange={handleChange}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></Select></div>
                <div><Label>Height (cm)</Label><Input name="height" type="number" value={form.height} onChange={handleChange} placeholder="165" /></div>
                <div><Label>Weight (kg)</Label><Input name="weight" type="number" value={form.weight} onChange={handleChange} placeholder="60" /></div>
              </div>
            </motion.div>
          )}
          {currentStep.id === 'lifestyle' && (
            <motion.div key="lifestyle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div><Label>Activity Level</Label><Select name="activityLevel" value={form.activityLevel} onChange={handleChange}><option value="">Select</option><option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very_active">Very Active</option></Select></div>
              <div><Label>Exercise Frequency</Label><Select name="exerciseFrequency" value={form.exerciseFrequency} onChange={handleChange}><option value="">Select</option><option value="none">None</option><option value="1-2">1-2 times/week</option><option value="3-4">3-4 times/week</option><option value="5+">5+ times/week</option></Select></div>
              <div><Label>Avg Sleep Hours</Label><Input name="sleepHours" type="number" value={form.sleepHours} onChange={handleChange} placeholder="7" min="3" max="14" /></div>
              <div><Label>Stress Level</Label><Select name="stressLevel" value={form.stressLevel} onChange={handleChange}><option value="">Select</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Select></div>
            </motion.div>
          )}
          {currentStep.id === 'nutrition' && (
            <motion.div key="nutrition" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div><Label>Diet Type</Label><Select name="dietType" value={form.dietType} onChange={handleChange}><option value="">Select</option><option value="omnivore">Omnivore</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="keto">Keto</option><option value="paleo">Paleo</option><option value="other">Other</option></Select></div>
              <div><Label>Water Intake (glasses/day)</Label><Input name="waterIntake" type="number" value={form.waterIntake} onChange={handleChange} placeholder="8" /></div>
              <div><Label>Typical Meals Per Day</Label><Input name="mealsPerDay" type="number" value={form.mealsPerDay} onChange={handleChange} placeholder="3" /></div>
            </motion.div>
          )}
          {currentStep.id === 'medical' && (
            <motion.div key="medical" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div><Label>Medical Conditions (comma-separated)</Label><Input name="medicalConditions" value={form.medicalConditions} onChange={handleChange} placeholder="e.g. Hypertension, Asthma" /></div>
              <div><Label>Allergies (comma-separated)</Label><Input name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g. Penicillin, Nuts" /></div>
              <div><Label>Current Medications</Label><Input name="medications" value={form.medications} onChange={handleChange} placeholder="e.g. Metformin 500mg" /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2"><input type="checkbox" name="bloodPressure" checked={form.bloodPressure} onChange={handleChange} /> Blood pressure issues</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="diabetes" checked={form.diabetes} onChange={handleChange} /> Diabetes</label>
              </div>
            </motion.div>
          )}
          {currentStep.id === 'womens' && (
            <motion.div key="womens" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {form.gender === 'female' ? (
                <>
                  <div><Label>Cycle Length (days)</Label><Input name="menstrualCycleLength" type="number" value={form.menstrualCycleLength} onChange={handleChange} placeholder="28" /></div>
                  <div><Label>Period Duration (days)</Label><Input name="periodDuration" type="number" value={form.periodDuration} onChange={handleChange} placeholder="5" /></div>
                  <div><Label>Last Period Date</Label><Input name="lastPeriodDate" type="date" value={form.lastPeriodDate} onChange={handleChange} /></div>
                  <div><Label>Pregnancy Status</Label><Select name="pregnancyStatus" value={form.pregnancyStatus} onChange={handleChange}><option value="">Select</option><option value="not_pregnant">Not Pregnant</option><option value="pregnant">Pregnant</option><option value="trying">Trying to Conceive</option></Select></div>
                </>
              ) : (
                <p className="text-muted-foreground py-4">This section is for women. You can skip.</p>
              )}
            </motion.div>
          )}
          {currentStep.id === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div><Label>Fitness Goal</Label><Select name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange}><option value="general_health">General Health</option><option value="weight_loss">Weight Loss</option><option value="weight_gain">Weight Gain</option><option value="maintenance">Maintenance</option><option value="fitness">Fitness</option></Select></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prev} disabled={step === 0}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
          {isLast ? (
            <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Complete Survey'}</Button>
          ) : (
            <Button onClick={next}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthSurvey;
