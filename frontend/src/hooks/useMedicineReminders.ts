import { useState, useEffect, useCallback, useRef } from 'react';
import { medicineAPI } from '@/services/api';

export interface UseMedicineRemindersOptions {
  enabled?: boolean;
}

export interface Reminder {
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledDate: string;
  scheduledTime: string;
  displayTime: string;
  status: string;
  isPast: boolean;
  isToday: boolean;
}

const NOTIFICATION_CHECK_INTERVAL = 60 * 1000; // 1 min
const SNOOZE_DURATION = 5 * 60 * 1000; // 5 min

export function useMedicineReminders(options: UseMedicineRemindersOptions = {}) {
  const { enabled = true } = options;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcoming, setUpcoming] = useState<Reminder[]>([]);
  const [popupReminder, setPopupReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const notifiedRef = useRef<Set<string>>(new Set());
  const snoozedUntilRef = useRef<Map<string, number>>(new Map());

  const loadReminders = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await medicineAPI.getReminders();
      const data: Reminder[] = res.data || [];
      setReminders(data);
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const pending = data.filter((r) => {
        if (r.status !== 'pending') return false;
        const [h, m] = (r.scheduledTime || '08:00').split(':').map(Number);
        const slotMins = h * 60 + m;
        const key = `${r.medicineId}-${r.scheduledTime}`;
        const snoozed = snoozedUntilRef.current.get(key);
        if (snoozed && Date.now() < snoozed) return false;
        return r.isToday ? slotMins >= currentMins - 30 : true;
      });
      setUpcoming(pending.slice(0, 5));
    } catch {
      setReminders([]);
      setUpcoming([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    loadReminders();
    const interval = setInterval(loadReminders, NOTIFICATION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [loadReminders, enabled]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setNotificationPermission(Notification.permission);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    return perm;
  }, []);

  const showBrowserNotification = useCallback((r: Reminder) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const key = `${r.medicineId}-${r.scheduledDate}-${r.scheduledTime}`;
    if (notifiedRef.current.has(key)) return;
    try {
      new Notification('Time for your medicine!', {
        body: `Time to take ${r.medicineName} – ${r.dosage}`,
        icon: '/favicon.ico',
      });
      notifiedRef.current.add(key);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const checkDue = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      for (const r of reminders) {
        if (r.status !== 'pending' || !r.isToday) continue;
        const [h, m] = (r.scheduledTime || '08:00').split(':').map(Number);
        const slotMins = h * 60 + m;
        const key = `${r.medicineId}-${r.scheduledDate}-${r.scheduledTime}`;
        if (snoozedUntilRef.current.get(`${r.medicineId}-${r.scheduledTime}`)) continue;
        if (Math.abs(slotMins - currentMins) <= 2 && !popupReminder) {
          setPopupReminder(r);
          showBrowserNotification(r);
        }
      }
    };
    const t = setInterval(checkDue, 30 * 1000);
    checkDue();
    return () => clearInterval(t);
  }, [reminders, popupReminder, showBrowserNotification]);

  const dismissPopup = useCallback(() => setPopupReminder(null), []);

  const snoozePopup = useCallback(() => {
    if (popupReminder) {
      const key = `${popupReminder.medicineId}-${popupReminder.scheduledTime}`;
      snoozedUntilRef.current.set(key, Date.now() + SNOOZE_DURATION);
      setPopupReminder(null);
    }
  }, [popupReminder]);

  const markTakenFromPopup = useCallback(async () => {
    if (!popupReminder) return;
    try {
      await medicineAPI.markTaken({
        medicineId: popupReminder.medicineId,
        scheduledDate: popupReminder.scheduledDate,
        scheduledTime: popupReminder.scheduledTime,
      });
      setPopupReminder(null);
      loadReminders();
    } catch {
      // toast handled by caller
    }
  }, [popupReminder, loadReminders]);

  const markSkippedFromPopup = useCallback(async () => {
    if (!popupReminder) return;
    try {
      await medicineAPI.markSkipped({
        medicineId: popupReminder.medicineId,
        scheduledDate: popupReminder.scheduledDate,
        scheduledTime: popupReminder.scheduledTime,
      });
      setPopupReminder(null);
      loadReminders();
    } catch {
      // toast handled by caller
    }
  }, [popupReminder, loadReminders]);

  return {
    reminders,
    upcoming,
    popupReminder,
    loading,
    notificationPermission,
    requestNotificationPermission,
    dismissPopup,
    snoozePopup,
    markTakenFromPopup,
    markSkippedFromPopup,
    loadReminders,
  };
}
