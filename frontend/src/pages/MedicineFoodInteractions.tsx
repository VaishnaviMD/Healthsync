import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PageCard } from '../components/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { interactionsAPI } from '../services/api';

interface InteractionResult {
  medicine: string;
  avoid: string[];
  recommended: string[];
  tips: string;
}

const suggestions = ['Iron tablets', 'Aspirin', 'Metformin', 'Warfarin', 'Statins', 'Levothyroxine', 'Antibiotics'];

export default function MedicineFoodInteractions() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (med?: string) => {
    const q = med || query;
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setResult(null);
    try {
      const { data } = await interactionsAPI.check(q);
      setResult(data);
    } catch {
      setResult(null);
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Medicine–Food Interactions">
      <div className="max-w-2xl mx-auto space-y-5">
        <PageCard title="Check Interactions" subtitle="Enter a medication name to see food interactions">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. Iron tablets, Metformin, Warfarin..."
                className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <motion.button onClick={() => search()} disabled={loading || !query.trim()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 gradient-primary text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? '...' : 'Check'}
            </motion.button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Common medications:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setQuery(s); search(s); }}
                  className="text-xs px-3 py-1 bg-muted hover:bg-accent border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </PageCard>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PageCard><div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-6 bg-muted/50 rounded animate-pulse" />)}</div></PageCard>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">Showing interactions for <strong>{result.medicine}</strong></p>
              </div>

              <PageCard title="Foods to Avoid" subtitle="These may reduce effectiveness or cause side effects">
                <div className="space-y-2">
                  {result.avoid.map((food, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/10 rounded-lg"
                    >
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      <span className="text-sm text-foreground">{food}</span>
                    </motion.div>
                  ))}
                </div>
              </PageCard>

              <PageCard title="Recommended Foods" subtitle="These may support absorption and effectiveness">
                <div className="space-y-2">
                  {result.recommended.map((food, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                      <span className="text-sm text-foreground">{food}</span>
                    </motion.div>
                  ))}
                </div>
              </PageCard>

              <PageCard>
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Pharmacist Tip</p>
                    <p className="text-sm text-muted-foreground">{result.tips}</p>
                  </div>
                </div>
              </PageCard>

              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ This is educational information only. Always consult your pharmacist or doctor about specific drug-food interactions for your medications.
                </p>
              </div>
            </motion.div>
          )}

          {searched && !result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PageCard>
                <p className="text-center text-muted-foreground text-sm py-4">No data found for this medication. Please try another name.</p>
              </PageCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
