import { create } from 'zustand';
import type { ConnectionMode } from '../../shared/types';

interface SyncState {
  queueCount: number;
  isOnline: boolean;
  connectionMode: ConnectionMode;
  lastSyncAt: string | null;
  lastPong: number | null;
  setQueueCount: (n: number) => void;
  setOnline: (v: boolean) => void;
  setConnectionMode: (m: ConnectionMode) => void;
  setLastSyncAt: (t: string) => void;
  setLastPong: (t: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  queueCount: 0,
  isOnline: navigator.onLine,
  connectionMode: 'offline',
  lastSyncAt: null,
  lastPong: null,
  setQueueCount: (queueCount) => set({ queueCount }),
  setOnline: (isOnline) => set({ isOnline }),
  setConnectionMode: (connectionMode) => set({ connectionMode }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setLastPong: (lastPong) => set({ lastPong }),
}));
