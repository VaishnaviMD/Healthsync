import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pill, Check, X, Clock } from 'lucide-react';
import type { Reminder } from '@/hooks/useMedicineReminders';

interface MedicineReminderPopupProps {
  reminder: Reminder | null;
  onMarkTaken: () => void;
  onSkip: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export function MedicineReminderPopup({
  reminder,
  onMarkTaken,
  onSkip,
  onSnooze,
  onDismiss,
}: MedicineReminderPopupProps) {
  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[100] w-full max-w-sm rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-xl shadow-primary/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Time to take your medicine</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {reminder.medicineName} – {reminder.dosage}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{reminder.displayTime}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={onMarkTaken} className="gap-1.5">
                  <Check className="h-4 w-4" /> Mark taken
                </Button>
                <Button size="sm" variant="outline" onClick={onSnooze} className="gap-1.5">
                  <Clock className="h-4 w-4" /> Snooze
                </Button>
                <Button size="sm" variant="ghost" onClick={onSkip} className="gap-1.5 text-muted-foreground">
                  <X className="h-4 w-4" /> Skip dose
                </Button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="rounded-lg p-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
