import { http } from '../services/http';
import { useSyncStore } from '../modules/sync/syncStore';
import { usePreferencesStore } from '../modules/sync/preferencesStore';
import { getPendingItems, dequeue, incrementRetry, refreshQueueCounts } from './syncQueue';
import { db } from '../db';
import { ATTENDANCE_KEYS } from '../modules/attendance/useAttendance';
import { GRADE_KEYS } from '../modules/gradebook/useGradebook';
import { queryClient } from '../app/queryClient';
import type { ConflictRecord } from '../shared/types';

const BATCH_SIZE = 500;

interface NetworkInformationLike {
  type?:          string;
  effectiveType?: string;
}

function isOnWifi(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (navigator as any).connection as NetworkInformationLike | undefined;
  if (!conn) return true; // Assume Wi-Fi when API unavailable (desktop browsers)
  if (conn.type === 'wifi' || conn.type === 'ethernet') return true;
  if (conn.type) return false;
  // effectiveType fallback — '4g' on Wi-Fi is common; 'cellular' classes only appear on mobile
  if (conn.effectiveType && /cellular|2g|3g/i.test(conn.effectiveType)) return false;
  return true;
}

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
    } else if (tableName === 'quarterlyGrades') {
      await db.quarterlyGrades.put({
        id:              payload['id'] as string ?? String(payload['_id']),
        classLoadId:     payload['classLoadId'] as string,
        studentId:       payload['studentId'] as string,
        quarter:         payload['quarter'] as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        wwWeighted:      payload['wwWeighted']      as number,
        ptWeighted:      payload['ptWeighted']      as number,
        qaWeighted:      payload['qaWeighted']      as number,
        initialGrade:    payload['initialGrade']    as number,
        transmutedGrade: payload['transmutedGrade'] as number,
        syncStatus:      'synced',
      });
    }
  }
  if (records.length > 0) {
    void queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: GRADE_KEYS.all });
  }
}

interface PushResponse {
  data: {
    processed: number;
    errors:    string[];
    conflicts: Array<{
      tableName:       string;
      recordId:        string;
      localUpdatedAt:  string;
      serverUpdatedAt: string;
    }>;
  };
}

interface PullResponse {
  data: {
    records: Array<{ tableName: string; payload: Record<string, unknown> }>;
  };
}

export interface DrainOptions {
  pushOnly?: boolean;
  pullOnly?: boolean;
  manual?:   boolean;
}

async function drainQueue(opts: DrainOptions = {}): Promise<void> {
  const { pushOnly = false, pullOnly = false, manual = false } = opts;
  const store    = useSyncStore.getState();
  const prefs    = usePreferencesStore.getState();

  if (!store.isOnline) return;

  if (!manual && prefs.wifiOnly && !isOnWifi()) {
    store.appendClientLog({
      type:        'push',
      recordCount: 0,
      status:      'failed',
      error:       'Wi-Fi only — sync paused on cellular',
    });
    return;
  }

  const lastSyncAt = store.lastSyncAt;
  let anyPushSuccess = !pullOnly; // when pull-only, treat push as a no-op success
  let anyPushFailure = false;
  let pushedCount    = 0;

  if (!pullOnly) {
    const items = await getPendingItems();
    if (items.length === 0) {
      anyPushSuccess = true;
    } else {
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        try {
          const res = await http.post<PushResponse>('/sync/push', { records: batch });
          for (const item of batch) {
            if (item.id != null) await dequeue(item.id);
          }
          pushedCount += res.data.data.processed ?? batch.length;
          anyPushSuccess = true;

          const conflicts = res.data.data.conflicts ?? [];
          if (conflicts.length > 0) {
            const mapped: ConflictRecord[] = conflicts.map(c => ({
              tableName:       c.tableName,
              recordId:        c.recordId,
              localUpdatedAt:  c.localUpdatedAt,
              serverUpdatedAt: c.serverUpdatedAt,
              detectedAt:     new Date().toISOString(),
            }));
            store.addConflicts(mapped);
            store.appendClientLog({
              type:        'push',
              recordCount: mapped.length,
              status:      'failed',
              error:       `${mapped.length} conflict${mapped.length !== 1 ? 's' : ''} — cloud is newer`,
            });
          }
        } catch (err) {
          anyPushFailure = true;
          const message = err instanceof Error ? err.message : 'push failed';
          for (const item of batch) {
            if (item.id != null) await incrementRetry(item.id, message);
          }
          store.appendClientLog({
            type:        'push',
            recordCount: batch.length,
            status:      'failed',
            error:       message,
          });
        }
      }
    }
  }

  if (!pushOnly) {
    try {
      const res = await http.post<PullResponse>('/sync/pull', { lastSyncAt: lastSyncAt ?? undefined });
      const records = res.data.data.records ?? [];
      await applyPulledRecords(records);
      if (records.length > 0) {
        store.appendClientLog({
          type:        'pull',
          recordCount: records.length,
          status:      'success',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'pull failed';
      store.appendClientLog({
        type:        'pull',
        recordCount: 0,
        status:      'failed',
        error:       message,
      });
      if (!pullOnly) anyPushFailure = true;
    }
  }

  if (anyPushSuccess && !anyPushFailure) {
    useSyncStore.getState().setLastSyncAt(new Date().toISOString());
  }

  await refreshQueueCounts();
  if (pushedCount > 0) {
    void queryClient.invalidateQueries({ queryKey: ['sync', 'logs'] });
    void queryClient.invalidateQueries({ queryKey: ['sync', 'status'] });
  }
}

let intervalTimer: ReturnType<typeof setInterval> | null = null;

function applyIntervalFromPrefs(): void {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
  const prefs = usePreferencesStore.getState();
  if (!prefs.autoSync) return;
  if (prefs.syncInterval === 'manual') return;

  const minutes = Number(prefs.syncInterval);
  if (!Number.isFinite(minutes) || minutes <= 0) return;

  intervalTimer = setInterval(() => {
    if (useSyncStore.getState().isOnline) void drainQueue();
  }, minutes * 60_000);
}

async function tryRegisterBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    // SyncManager is non-standard; feature-detect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sync = (reg as any).sync as { register?: (tag: string) => Promise<void> } | undefined;
    if (sync?.register) await sync.register('aralsync-queue');
  } catch { /* SW not registered or sync not supported */ }
}

export function initBackgroundSync(): () => void {
  void refreshQueueCounts();

  applyIntervalFromPrefs();

  const unsubPrefs = usePreferencesStore.subscribe((state, prev) => {
    if (state.autoSync !== prev.autoSync || state.syncInterval !== prev.syncInterval) {
      applyIntervalFromPrefs();
    }
    if (state.backgroundSync && !prev.backgroundSync) {
      void tryRegisterBackgroundSync();
    }
  });

  if (usePreferencesStore.getState().backgroundSync) {
    void tryRegisterBackgroundSync();
  }

  const onOnline = () => {
    useSyncStore.getState().setOnline(true);
    if (useSyncStore.getState().lanPeers.length === 0) {
      useSyncStore.getState().setConnectionMode('cloud');
    }
    if (usePreferencesStore.getState().autoSync) void drainQueue();
  };

  const onOffline = () => {
    useSyncStore.getState().setOnline(false);
    useSyncStore.getState().setConnectionMode('offline');
  };

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  if (navigator.onLine) {
    useSyncStore.getState().setConnectionMode('cloud');
    if (usePreferencesStore.getState().autoSync) void drainQueue();
  }

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    if (intervalTimer) clearInterval(intervalTimer);
    intervalTimer = null;
    unsubPrefs();
  };
}

export { drainQueue };
