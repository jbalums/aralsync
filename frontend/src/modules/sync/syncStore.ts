import { create } from 'zustand';
import type { ConnectionMode, LanPeer, ConflictRecord } from '../../shared/types';

export interface ClientSyncLogEntry {
  id:          string;
  type:        'push' | 'pull';
  recordCount: number;
  status:      'success' | 'failed';
  error?:      string;
  createdAt:   string;
  source:      'client';
}

interface SyncState {
  queueCount:     number;
  failedCount:    number;
  isOnline:       boolean;
  connectionMode: ConnectionMode;
  lastSyncAt:     string | null;
  lastPong:       number | null;
  lanPeers:       LanPeer[];
  conflicts:      ConflictRecord[];
  clientLog:      ClientSyncLogEntry[];
  setQueueCount:     (n: number)            => void;
  setFailedCount:    (n: number)            => void;
  setOnline:         (v: boolean)           => void;
  setConnectionMode: (m: ConnectionMode)    => void;
  setLastSyncAt:     (t: string | null)     => void;
  setLastPong:       (t: number)            => void;
  setLanPeers:       (peers: LanPeer[])     => void;
  addConflicts:      (c: ConflictRecord[])  => void;
  clearConflicts:    ()                     => void;
  appendClientLog:   (e: Omit<ClientSyncLogEntry, 'id' | 'createdAt' | 'source'>) => void;
}

const MAX_CLIENT_LOG = 20;

export const useSyncStore = create<SyncState>((set) => ({
  queueCount:     0,
  failedCount:    0,
  isOnline:       navigator.onLine,
  connectionMode: 'offline',
  lastSyncAt:     null,
  lastPong:       null,
  lanPeers:       [],
  conflicts:      [],
  clientLog:      [],
  setQueueCount:     (queueCount)     => set({ queueCount }),
  setFailedCount:    (failedCount)    => set({ failedCount }),
  setOnline:         (isOnline)       => set({ isOnline }),
  setConnectionMode: (connectionMode) => set({ connectionMode }),
  setLastSyncAt:     (lastSyncAt)     => set({ lastSyncAt }),
  setLastPong:       (lastPong)       => set({ lastPong }),
  setLanPeers:       (lanPeers)       => set({ lanPeers }),
  addConflicts:      (newConflicts)   => set((s) => ({
    conflicts: [
      ...newConflicts,
      ...s.conflicts.filter(c =>
        !newConflicts.some(n => n.tableName === c.tableName && n.recordId === c.recordId),
      ),
    ].slice(0, 50),
  })),
  clearConflicts:    ()               => set({ conflicts: [] }),
  appendClientLog:   (e)              => set((s) => ({
    clientLog: [
      {
        ...e,
        id:        Math.random().toString(36).slice(2, 9),
        createdAt: new Date().toISOString(),
        source:    'client' as const,
      },
      ...s.clientLog,
    ].slice(0, MAX_CLIENT_LOG),
  })),
}));
