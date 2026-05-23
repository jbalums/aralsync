import { db } from '../db';
import type { SyncQueueItem } from '../shared/types';
import { useSyncStore } from '../modules/sync/syncStore';

export async function enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries'>): Promise<void> {
  await db.syncQueue.add({
    ...item,
    createdAt: new Date().toISOString(),
    retries: 0,
  });
  const count = await db.syncQueue.count();
  useSyncStore.getState().setQueueCount(count);
}

export async function dequeue(id: number): Promise<void> {
  await db.syncQueue.delete(id);
  const count = await db.syncQueue.count();
  useSyncStore.getState().setQueueCount(count);
}

export async function retryFailed(): Promise<void> {
  await db.syncQueue.where('retries').above(3).delete();
  const count = await db.syncQueue.count();
  useSyncStore.getState().setQueueCount(count);
}

export async function getPendingItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.toArray();
}

export async function incrementRetry(id: number): Promise<void> {
  const item = await db.syncQueue.get(id);
  if (item && item.id != null) {
    await db.syncQueue.update(item.id, { retries: item.retries + 1 });
  }
}
