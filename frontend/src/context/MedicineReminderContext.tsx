import { createContext, useContext, ReactNode } from 'react';
import { useMedicineReminders } from '@/hooks/useMedicineReminders';
import { useAuth } from '@/context/AuthContext';

type MedicineReminderContextType = ReturnType<typeof useMedicineReminders>;
const MedicineReminderContext = createContext<MedicineReminderContextType | null>(null);

export function MedicineReminderProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const value = useMedicineReminders({ enabled: !!token });
  return (
    <MedicineReminderContext.Provider value={value}>
      {children}
    </MedicineReminderContext.Provider>
  );
}

export function useMedicineReminderContext() {
  const ctx = useContext(MedicineReminderContext);
  return ctx;
}
