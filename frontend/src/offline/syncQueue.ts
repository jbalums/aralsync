import { db } from '../db';
import type { SyncQueueItem } from '../shared/types';
import { useSyncStore } from '../modules/sync/syncStore';

export const MAX_RETRIES = 5;

async function refreshCounts(): Promise<void> {
  const [pending, failed] = await Promise.all([
    db.syncQueue.where('status').notEqual('failed').count(),
    db.syncQueue.where('status').equals('failed').count(),
  ]);
  // queueCount represents items still attemptable (pending), failed shown separately
  useSyncStore.getState().setQueueCount(pending);
  useSyncStore.getState().setFailedCount(failed);
}

export async function enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries' | 'status'>): Promise<void> {
  await db.syncQueue.add({
    ...item,
    createdAt: new Date().toISOString(),
    retries:   0,
    status:    'pending',
  });
  await refreshCounts();
}

export async function dequeue(id: number): Promise<void> {
  await db.syncQueue.delete(id);
  await refreshCounts();
}

export async function getPendingItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.where('status').notEqual('failed').toArray();
}

export async function getFailedItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.where('status').equals('failed').toArray();
}

export async function incrementRetry(id: number, error?: string): Promise<void> {
  const item = await db.syncQueue.get(id);
  if (!item || item.id == null) return;
  const retries = item.retries + 1;
  await db.syncQueue.update(item.id, {
    retries,
    lastError: error,
    status: retries >= MAX_RETRIES ? 'failed' : 'pending',
  });
  await refreshCounts();
}

export async function retryItem(id: number): Promise<void> {
  await db.syncQueue.update(id, { retries: 0, status: 'pending', lastError: undefined });
  await refreshCounts();
}

export async function retryAllFailed(): Promise<void> {
  await db.syncQueue
    .where('status').equals('failed')
    .modify({ retries: 0, status: 'pending', lastError: undefined });
  await refreshCounts();
}

export async function discardItem(id: number): Promise<void> {
  await db.syncQueue.delete(id);
  await refreshCounts();
}

export async function discardAllFailed(): Promise<void> {
  await db.syncQueue.where('status').equals('failed').delete();
  await refreshCounts();
}

export async function refreshQueueCounts(): Promise<void> {
  await refreshCounts();
}
