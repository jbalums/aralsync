import { http } from '../services/http';
import { useSyncStore } from '../modules/sync/syncStore';
import { getPendingItems, dequeue, incrementRetry } from './syncQueue';
import { db } from '../db';
import { ATTENDANCE_KEYS } from '../modules/attendance/useAttendance';
import { GRADE_KEYS } from '../modules/gradebook/useGradebook';
import { queryClient } from '../app/queryClient';

const BATCH_SIZE = 500;

async function applyPulledRecords(records: Array<{ tableName: string; payload: Record<string, unknown> }>): Promise<void> {
  for (const { tableName, payload } of records) {
    if (tableName === 'attendanceRecords') {
      await db.attendanceRecords.put({
        id:          payload['id'] as string ?? String(payload['_id']),
        classLoadId: payload['classLoadId'] as string,
        studentId:   payload['studentId'] as string,
        date:        payload['date'] as string,
        session:     payload['session'] as 'AM' | 'PM',
        status:      payload['status'] as 'present' | 'absent' | 'late' | 'excused',
        syncStatus:  'synced',
        updatedAt:   payload['updatedAt'] as string ?? new Date().toISOString(),
      });
    } else if (tableName === 'gradeEntries') {
      await db.gradeEntries.put({
        id:          payload['id'] as string ?? String(payload['_id']),
        classLoadId: payload['classLoadId'] as string,
        studentId:   payload['studentId'] as string,
        quarter:     payload['quarter'] as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        component:   payload['component'] as 'WW' | 'PT' | 'QA',
        columnLabel: payload['columnLabel'] as string,
        score:       payload['score'] as number,
        maxScore:    payload['maxScore'] as number,
        syncStatus:  'synced',
        updatedAt:   payload['updatedAt'] as string ?? new Date().toISOString(),
      });
    }
  }
  if (records.length > 0) {
    void queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: GRADE_KEYS.all });
  }
}

async function drainQueue(): Promise<void> {
  const items = await getPendingItems();
  if (items.length === 0) return;

  const lastSyncAt = useSyncStore.getState().lastSyncAt;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    try {
      await http.post('/sync/push', { records: batch });
      for (const item of batch) {
        if (item.id != null) await dequeue(item.id);
      }
    } catch {
      for (const item of batch) {
        if (item.id != null) await incrementRetry(item.id);
      }
    }
  }

  const now = new Date().toISOString();
  useSyncStore.getState().setLastSyncAt(now);

  // Pull records updated since last sync
  try {
    const res = await http.post<{ data: { records: Array<{ tableName: string; payload: Record<string, unknown> }> } }>(
      '/sync/pull',
      { lastSyncAt: lastSyncAt ?? undefined },
    );
    await applyPulledRecords(res.data.data.records);
  } catch { /* pull failures are non-fatal */ }
}

export function initBackgroundSync(): () => void {
  // Seed initial queueCount from Dexie
  void db.syncQueue.count().then(n => useSyncStore.getState().setQueueCount(n));

  const onOnline = () => {
    useSyncStore.getState().setOnline(true);
    useSyncStore.getState().setConnectionMode('cloud');
    void drainQueue();
  };

  const onOffline = () => {
    useSyncStore.getState().setOnline(false);
    useSyncStore.getState().setConnectionMode('offline');
  };

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  if (navigator.onLine) {
    useSyncStore.getState().setConnectionMode('cloud');
    void drainQueue();
  }

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// Exported for manual "Sync Now" trigger from the UI
export { drainQueue };
