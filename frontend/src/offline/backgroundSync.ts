import { http } from '../services/http';
import { useSyncStore } from '../modules/sync/syncStore';
import { getPendingItems, dequeue, incrementRetry } from './syncQueue';

const BATCH_SIZE = 500;

async function drainQueue(): Promise<void> {
  const items = await getPendingItems();
  if (items.length === 0) return;

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

  useSyncStore.getState().setLastSyncAt(new Date().toISOString());
}

export function initBackgroundSync(): () => void {
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
