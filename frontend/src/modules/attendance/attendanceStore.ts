import { create } from 'zustand';
import type { AttendanceStatus, Session } from '../../shared/types';

interface AttendanceState {
  session: Session;
  date: string;
  unsavedStatuses: Record<string, AttendanceStatus>;
  setSession: (s: Session) => void;
  setDate: (d: string) => void;
  setStatus: (studentId: string, status: AttendanceStatus) => void;
  clearUnsaved: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  session: 'AM',
  date: new Date().toISOString().split('T')[0],
  unsavedStatuses: {},
  setSession: (session) => set({ session }),
  setDate: (date) => set({ date }),
  setStatus: (studentId, status) =>
    set((s) => ({ unsavedStatuses: { ...s.unsavedStatuses, [studentId]: status } })),
  clearUnsaved: () => set({ unsavedStatuses: {} }),
}));
