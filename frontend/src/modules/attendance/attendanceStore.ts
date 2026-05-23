import { create } from 'zustand';
import { useAuthStore } from '../auth/authStore';
import type { AttendanceStatus, Session, ClassLoadDetail } from '../../shared/types';

interface AttendanceState {
  session:        Session;
  date:           string;
  unsavedStatuses: Record<string, AttendanceStatus>;
  setSession:     (s: Session) => void;
  setDate:        (d: string) => void;
  setStatus:      (studentId: string, status: AttendanceStatus) => void;
  clearUnsaved:   () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  session:         'AM',
  date:            new Date().toISOString().split('T')[0],
  unsavedStatuses: {},
  setSession:      (session) => set({ session }),
  setDate:         (date)    => set({ date }),
  setStatus: (studentId, status) =>
    set((s) => ({ unsavedStatuses: { ...s.unsavedStatuses, [studentId]: status } })),
  clearUnsaved: () => set({ unsavedStatuses: {} }),
}));

export function canSubmitAttendance(
  classLoad: ClassLoadDetail | undefined,
): { allowed: boolean; reason?: string } {
  const user = useAuthStore.getState().user;
  if (!user)      return { allowed: false, reason: 'Not authenticated' };
  if (!classLoad) return { allowed: false, reason: 'No class load selected' };

  // advisory_teacher and above bypass the schedule gate
  if (['advisory_teacher', 'school_admin', 'super_admin'].includes(user.role)) {
    return { allowed: true };
  }

  // subject_teacher: enforce ±15 min window around scheduled time
  const { schedule } = classLoad;
  if (!schedule || !schedule.dayOfWeek?.length) return { allowed: true };

  const now       = new Date();
  const todayDow  = now.getDay();
  if (!schedule.dayOfWeek.includes(todayDow)) {
    return { allowed: false, reason: 'Not scheduled for today' };
  }

  const [startH, startM] = schedule.timeStart.split(':').map(Number);
  const [endH,   endM  ] = schedule.timeEnd.split(':').map(Number);
  const sStart = new Date(now); sStart.setHours(startH, startM, 0, 0);
  const sEnd   = new Date(now); sEnd.setHours(endH,   endM,   0, 0);
  const WINDOW = 15 * 60 * 1000;

  if (now < new Date(sStart.getTime() - WINDOW) || now > new Date(sEnd.getTime() + WINDOW)) {
    return {
      allowed: false,
      reason:  `Submit window: ${schedule.timeStart}–${schedule.timeEnd} (±15 min)`,
    };
  }

  return { allowed: true };
}
