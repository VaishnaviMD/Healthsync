import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { interactionAPI } from '@/services/api';
import { AlertTriangle, CheckCircle, Search, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicineFood = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try { const r = await interactionAPI.check(query); setResult(r.data); }
    catch { setResult(null); }
    finally { setLoading(false); }
  };

  const examples = ['Iron tablets', 'Warfarin', 'Metformin', 'Statins', 'Antibiotics', 'Aspirin'];

  return (
    <AppLayout title="Medicine–Food Interactions">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageCard title="Check Interactions" subtitle="Enter a medicine name to see food interactions">
          <div className="flex gap-3">
            <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="e.g. Iron tablets, Warfarin, Metformin..." />
            <Button onClick={check} disabled={loading || !query.trim()}>
              <Search className="h-4 w-4 mr-2" /> {loading ? 'Checking...' : 'Check'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Try:</span>
            {examples.map(ex => (
              <button key={ex} onClick={() => { setQuery(ex); }} className="text-xs bg-muted px-2.5 py-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">{ex}</button>
            ))}
          </div>
        </PageCard>

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {result.found ? (
              <>
                <PageCard>
                  <h3 className="font-semibold text-lg mb-4 text-foreground capitalize">{result.medicine}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm text-destructive">Foods to Avoid</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.avoid.map((food: string) => (
                          <span key={food} className="text-sm bg-destructive/10 text-destructive px-3 py-1 rounded-full capitalize">{food}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium text-sm text-success">Recommended Foods</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.recommended.map((food: string) => (
                          <span key={food} className="text-sm bg-success/10 text-success px-3 py-1 rounded-full capitalize">{food}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </PageCard>
              </>
            ) : (
              <PageCard>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">No specific data found for "{result.medicine}"</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  </div>
                </div>
              </PageCard>
            )}
            <p className="text-xs text-muted-foreground text-center">⚠️ Always consult your pharmacist or healthcare provider for personalized medication advice.</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default MedicineFood;
