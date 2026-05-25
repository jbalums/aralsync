import { http } from '../../services/http';
import { db } from '../../db';
import { useSyncStore } from './syncStore';
import { drainQueue } from '../../offline/backgroundSync';
import { retryAllFailed, discardAllFailed, refreshQueueCounts } from '../../offline/syncQueue';

export interface SyncStatus {
  lastSyncAt: string | null;
}

export interface SyncLogEntry {
  id:            string;
  type:          'push' | 'pull';
  recordCount:   number;
  conflictCount: number;
  status:        'success' | 'failed';
  error?:        string;
  createdAt:     string;
}

export const syncApiService = {
  async getStatus(): Promise<SyncStatus> {
    const res = await http.get<{ data: SyncStatus }>('/sync/status');
    return res.data.data;
  },

  async getLogs(): Promise<SyncLogEntry[]> {
    const res = await http.get<{ data: SyncLogEntry[] }>('/sync/logs');
    return res.data.data;
  },

  async forcePull(): Promise<void> {
    await drainQueue({ pullOnly: true, manual: true });
  },

  async retryAllFailed(): Promise<void> {
    await retryAllFailed();
    await drainQueue({ manual: true });
  },

  async discardAllFailed(): Promise<void> {
    await discardAllFailed();
    await refreshQueueCounts();
  },

  async clearLocalCache(): Promise<void> {
    // Wipe Dexie tables that hold synced data (preserve users so refresh token persists).
    // Use array form because Dexie's variadic overload caps at ~5 tables.
    const tables = [
      db.attendanceRecords,
      db.gradeEntries,
      db.quarterlyGrades,
      db.students,
      db.classLoads,
      db.sections,
      db.subjects,
      db.schoolYears,
      db.schools,
      db.syncQueue,
    ];
    await db.transaction('rw', tables, async () => {
      for (const t of tables) await t.clear();
    });
    useSyncStore.getState().setLastSyncAt(null);
    useSyncStore.getState().clearConflicts();
    await refreshQueueCounts();
  },
};
