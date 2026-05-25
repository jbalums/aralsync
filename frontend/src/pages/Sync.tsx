// @ts-nocheck — matches the rest of pages/* (shared component types are intentionally loose)
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Icon, Card, SectionHeader, Btn, EmptyState, useToast,
  ConnPill, Badge, Tabs, Modal,
} from '../components';
import { useSyncStore } from '../modules/sync/syncStore';
import { syncApiService, type SyncLogEntry } from '../modules/sync/sync.service';
import { drainQueue } from '../offline/backgroundSync';
import { db } from '../db';
import { MAX_RETRIES, retryItem, discardItem } from '../offline/syncQueue';
import type { SyncQueueItem, LanPeer, ConflictRecord } from '../shared/types';

type QueueTab = 'pending' | 'failed';

const ROLE_LABELS: Record<string, string> = {
  super_admin:      'Super admin',
  school_admin:     'Admin',
  advisory_teacher: 'Adviser',
  subject_teacher:  'Teacher',
};

const TABLE_LABELS: Record<string, string> = {
  attendanceRecords: 'Attendance',
  gradeEntries:      'Grade entry',
  quarterlyGrades:   'Quarterly grade',
};

const TABLE_ICONS: Record<string, string> = {
  attendanceRecords: 'clipboard-check',
  gradeEntries:      'pencil-line',
  quarterlyGrades:   'graduation-cap',
};

export function PageSync() {
  const {
    isOnline, queueCount, failedCount, connectionMode, lastSyncAt,
    lanPeers, conflicts, clientLog, clearConflicts,
  } = useSyncStore();
  const [syncing, setSyncing]                 = useState(false);
  const [pulling, setPulling]                 = useState(false);
  const [tab, setTab]                         = useState<QueueTab>('pending');
  const [confirmClear, setConfirmClear]       = useState(false);
  const toast                                 = useToast();
  const qc                                    = useQueryClient();

  const { data: syncStatus } = useQuery({
    queryKey: ['sync', 'status'],
    queryFn:  () => syncApiService.getStatus(),
    refetchInterval: 30_000,
    staleTime:       60_000,
  });

  const { data: serverLogs = [] } = useQuery<SyncLogEntry[]>({
    queryKey: ['sync', 'logs'],
    queryFn:  () => syncApiService.getLogs(),
    refetchInterval: 60_000,
    staleTime:       60_000,
  });

  const { data: queueItems = [] } = useQuery<SyncQueueItem[]>({
    queryKey: ['sync', 'queue-items'],
    queryFn:  () => db.syncQueue.toArray(),
    refetchInterval: 5_000,
  });

  const { data: storage } = useQuery({
    queryKey: ['sync', 'storage'],
    queryFn: async () => {
      if (!navigator.storage?.estimate) return null;
      const est = await navigator.storage.estimate();
      const usedMB = ((est.usage ?? 0) / (1024 * 1024)).toFixed(1);
      const totalGB = (((est.quota ?? 0) / (1024 * 1024)) / 1024).toFixed(1);
      const pct = (est.quota ?? 0) > 0 ? ((est.usage ?? 0) / (est.quota ?? 1)) * 100 : 0;
      return { usedMB, totalGB, pct };
    },
    refetchInterval: 30_000,
  });

  const pending = useMemo(() => queueItems.filter(i => i.status !== 'failed'), [queueItems]);
  const failed  = useMemo(() => queueItems.filter(i => i.status === 'failed'), [queueItems]);

  const invalidateQueue = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['sync', 'queue-items'] });
  }, [qc]);

  const doSync = useCallback(async () => {
    if (!isOnline) {
      toast?.push({ type: 'warning', message: 'You are offline. Will sync when reconnected.' });
      return;
    }
    setSyncing(true);
    try {
      await drainQueue({ manual: true });
      toast?.push({ type: 'success', title: 'Synced', message: 'Queue drained.' });
    } catch {
      toast?.push({ type: 'error', message: 'Sync failed. Will retry automatically.' });
    } finally {
      setSyncing(false);
      invalidateQueue();
    }
  }, [isOnline, toast, invalidateQueue]);

  const doForcePull = useCallback(async () => {
    if (!isOnline) {
      toast?.push({ type: 'warning', message: 'You are offline.' });
      return;
    }
    setPulling(true);
    try {
      await syncApiService.forcePull();
      toast?.push({ type: 'success', title: 'Pulled from cloud', message: 'Local data refreshed.' });
    } catch {
      toast?.push({ type: 'error', message: 'Pull failed.' });
    } finally {
      setPulling(false);
    }
  }, [isOnline, toast]);

  const retryRow = useMutation({
    mutationFn: async (id: number) => {
      await retryItem(id);
      await drainQueue({ manual: true });
    },
    onSuccess: () => { invalidateQueue(); toast?.push({ type: 'success', message: 'Retrying record.' }); },
  });

  const discardRow = useMutation({
    mutationFn: (id: number) => discardItem(id),
    onSuccess: () => { invalidateQueue(); toast?.push({ type: 'info', message: 'Record discarded.' }); },
  });

  const retryAll = useMutation({
    mutationFn: () => syncApiService.retryAllFailed(),
    onSuccess: () => { invalidateQueue(); toast?.push({ type: 'success', message: 'Retrying all failed.' }); },
  });

  const discardAll = useMutation({
    mutationFn: () => syncApiService.discardAllFailed(),
    onSuccess: () => { invalidateQueue(); toast?.push({ type: 'info', message: 'Failed records discarded.' }); },
  });

  const clearCache = useMutation({
    mutationFn: () => syncApiService.clearLocalCache(),
    onSuccess: () => {
      setConfirmClear(false);
      invalidateQueue();
      toast?.push({ type: 'success', title: 'Cache cleared', message: 'Local data has been removed.' });
    },
    onError: () => toast?.push({ type: 'error', message: 'Failed to clear local cache.' }),
  });

  const displayLastSync = syncStatus?.lastSyncAt ?? lastSyncAt;
  const lastSyncLabel = displayLastSync
    ? new Date(displayLastSync).toLocaleString()
    : 'Never';

  const modeLabel =
    connectionMode === 'lan'   ? 'LAN mode'
    : connectionMode === 'cloud' ? 'Cloud mode'
    : 'Offline';

  // Merge server + client logs, newest first, capped at 20
  const allLogs = useMemo(() => {
    const merged = [
      ...serverLogs.map(l => ({ ...l, source: 'server' as const })),
      ...clientLog.map(l => ({ ...l, conflictCount: 0 })),
    ];
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged.slice(0, 20);
  }, [serverLogs, clientLog]);

  return (
    <div className="page-anim space-y-5">
      {/* Connection map */}
      <Card className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50"/>
        <div className="relative">
          <SectionHeader
            title="Connection map"
            subtitle="Devices, peers, and the cloud"
            right={
              <div className="flex items-center gap-2">
                <ConnPill online={isOnline}/>
                <Btn
                  size="sm"
                  variant="ghost"
                  icon={pulling ? 'loader-2' : 'cloud-download'}
                  onClick={doForcePull}
                  disabled={pulling || !isOnline}
                >
                  {pulling ? 'Pulling…' : 'Pull from cloud'}
                </Btn>
              </div>
            }
          />
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center">
            <NodeBox
              icon="laptop"
              title={lanPeers.length > 0 ? `${lanPeers.length} LAN peer${lanPeers.length !== 1 ? 's' : ''}` : 'No LAN peers'}
              subtitle={lanPeers.length > 0 ? 'Same WiFi · syncing' : 'No peers detected'}
              online={lanPeers.length > 0}
              color="#6366F1"
            />

            <div className="flex flex-col items-center">
              <svg viewBox="0 0 240 80" className="w-full max-w-[260px]">
                <line x1="10" y1="40" x2="100" y2="40" stroke="#6366F1" strokeWidth="2.4"
                  strokeDasharray={lanPeers.length > 0 ? '6 4' : '4 4'}
                  className={lanPeers.length > 0 ? 'dash-anim' : ''}/>
                <line x1="140" y1="40" x2="230" y2="40"
                  stroke={isOnline ? '#10B981' : '#94A3B8'} strokeWidth="2.4"
                  className={isOnline ? 'dash-anim' : ''}/>
                <circle cx="120" cy="40" r="22" fill="#0F766E"/>
                <text x="120" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{queueCount}</text>
              </svg>
              <div className="mt-2 text-[13px] font-semibold text-navy text-center">This Device</div>
              <div className="text-[11px] text-muted text-center">{modeLabel}</div>
              <div className="mt-3 flex items-center gap-2">
                <Btn
                  variant="primary" size="sm"
                  icon={syncing ? 'loader-2' : 'cloud-upload'}
                  onClick={doSync}
                  disabled={!queueCount || syncing || !isOnline}
                  className={syncing ? 'opacity-90' : ''}
                >
                  {syncing ? 'Syncing…' : queueCount ? `Sync ${queueCount} now` : 'Up to date'}
                </Btn>
              </div>
            </div>

            <NodeBox
              icon={isOnline ? 'cloud' : 'cloud-off'}
              title="DepEd Cloud"
              subtitle={isOnline ? 'Connected · auto-sync' : 'Unreachable · queued'}
              online={isOnline}
              color={isOnline ? '#10B981' : '#94A3B8'}
              alignRight
            />
          </div>
        </div>
      </Card>

      {/* Conflicts (only when non-empty) */}
      {conflicts.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50/40">
          <SectionHeader
            title={`Conflicts (${conflicts.length})`}
            subtitle="Cloud copy was newer — your local edit was not applied"
            right={<Btn size="sm" variant="ghost" icon="x" onClick={clearConflicts}>Clear</Btn>}
          />
          <ul className="divide-y divide-amber-200/60">
            {conflicts.map((c) => (
              <ConflictRow key={`${c.tableName}:${c.recordId}:${c.detectedAt}`} conflict={c}/>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Queue: Pending / Failed tabs */}
        <Card className="p-5">
          <SectionHeader
            title="Local queue"
            subtitle={
              queueCount + failedCount === 0
                ? 'Nothing pending — you are all caught up'
                : `${pending.length} pending · ${failed.length} failed`
            }
            right={queueCount > 0
              ? <Btn size="sm" variant="primary" icon={syncing ? 'loader-2' : 'cloud-upload'} onClick={doSync} disabled={!isOnline || syncing}>{syncing ? 'Syncing…' : 'Sync now'}</Btn>
              : null}
          />
          <Tabs
            tabs={[
              { id: 'pending', label: 'Pending', count: pending.length, icon: 'clock' },
              { id: 'failed',  label: 'Failed',  count: failed.length,  icon: 'alert-triangle' },
            ]}
            active={tab}
            onChange={(id: QueueTab) => setTab(id)}
            className="mb-3"
          />
          {tab === 'pending' ? (
            pending.length === 0 ? (
              <EmptyState icon="check-circle" title="All synced" description="Records will appear here when you make changes offline."/>
            ) : (
              <ul className="divide-y divide-line">
                {pending.map(item => (
                  <QueueRow
                    key={item.id}
                    item={item}
                    onRetry={() => item.id != null && retryRow.mutate(item.id)}
                    onDiscard={() => item.id != null && discardRow.mutate(item.id)}
                  />
                ))}
              </ul>
            )
          ) : (
            failed.length === 0 ? (
              <EmptyState icon="shield-check" title="No failed records" description={`Records that fail ${MAX_RETRIES} retry attempts appear here.`}/>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-3">
                  <Btn size="sm" variant="primary" icon="refresh-cw" onClick={() => retryAll.mutate()} disabled={!isOnline || retryAll.isPending}>Retry all failed</Btn>
                  <Btn size="sm" variant="ghost"   icon="trash-2"    onClick={() => discardAll.mutate()} disabled={discardAll.isPending}>Discard all</Btn>
                </div>
                <ul className="divide-y divide-line">
                  {failed.map(item => (
                    <QueueRow
                      key={item.id}
                      item={item}
                      onRetry={() => item.id != null && retryRow.mutate(item.id)}
                      onDiscard={() => item.id != null && discardRow.mutate(item.id)}
                    />
                  ))}
                </ul>
              </>
            )
          )}
        </Card>

        {/* Sync log */}
        <Card className="p-5">
          <SectionHeader
            title="Sync log"
            subtitle={isOnline ? 'Last 20 events' : 'Offline — showing cached log'}
          />
          {allLogs.length === 0 ? (
            <EmptyState icon="clock" title="No sync history" description="Sync events will appear here once you connect."/>
          ) : (
            <ul className="space-y-1">
              {allLogs.map(entry => (
                <li key={entry.id} className="flex items-center gap-3 text-[12.5px] py-1.5 border-b border-line/60 last:border-0">
                  <span className={`w-6 h-6 rounded-md inline-flex items-center justify-center flex-shrink-0 ${entry.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    <Icon name={entry.status === 'success' ? 'check' : 'x'} size={12}/>
                  </span>
                  <span className={`flex-1 truncate ${entry.status === 'success' ? 'text-navy' : 'text-rose-700'}`}>
                    {entry.type === 'push' ? '↑ Push' : '↓ Pull'} · {entry.recordCount} record{entry.recordCount !== 1 ? 's' : ''}
                    {entry.conflictCount > 0 ? ` · ${entry.conflictCount} conflict${entry.conflictCount !== 1 ? 's' : ''}` : ''}
                    {entry.error ? ` · ${entry.error}` : ''}
                  </span>
                  <span className="text-muted text-[11px] flex-shrink-0">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* LAN peers */}
        <Card className="p-5">
          <SectionHeader
            title="LAN peers"
            subtitle={lanPeers.length > 0 ? `${lanPeers.length} device${lanPeers.length !== 1 ? 's' : ''} on the same network` : 'No peers on this network'}
          />
          {lanPeers.length === 0 ? (
            <EmptyState icon="wifi-off" title="No peers detected" description="Other AralSync devices on the same WiFi will appear here automatically."/>
          ) : (
            <ul className="divide-y divide-line">
              {lanPeers.map(p => <PeerRow key={p.deviceId} peer={p}/>)}
            </ul>
          )}
        </Card>

        {/* Storage */}
        <Card className="p-5">
          <SectionHeader
            title="Local storage"
            subtitle={storage ? `${storage.usedMB} MB used · ${storage.totalGB} GB quota` : 'Estimating…'}
            right={
              <Btn size="sm" variant="ghost" icon="trash-2" onClick={() => setConfirmClear(true)}>Clear cache</Btn>
            }
          />
          {storage ? (
            <div className="rounded-md border border-line p-3">
              <div className="flex items-end gap-3 mb-2">
                <div className="text-[26px] font-semibold text-navy font-mono leading-none">
                  {storage.usedMB}<span className="text-[14px] text-muted"> MB</span>
                </div>
                <div className="text-[11px] text-muted">{storage.pct.toFixed(1)}% of {storage.totalGB} GB</div>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                <div style={{ width: `${Math.min(storage.pct, 100)}%`, background: '#0F766E' }} className="h-full transition-all"/>
              </div>
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-[12px] text-muted">Loading storage info…</div>
          )}
          <div className="mt-3 text-[11px] text-muted">Last sync: <span className="text-navy font-medium">{lastSyncLabel}</span></div>
        </Card>
      </div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear local cache?"
        subtitle="Local copies of attendance, grades, students, and classes will be removed. Pending records in the queue will also be cleared. You may need to pull from cloud again."
        footer={
          <>
            <Btn variant="ghost" onClick={() => setConfirmClear(false)} disabled={clearCache.isPending}>Cancel</Btn>
            <Btn variant="danger" icon="trash-2" onClick={() => clearCache.mutate()} disabled={clearCache.isPending}>
              {clearCache.isPending ? 'Clearing…' : 'Clear cache'}
            </Btn>
          </>
        }
      >
        <p className="text-[13px] text-muted">
          This is destructive but reversible — once cleared, click <strong>Pull from cloud</strong> to repopulate.
        </p>
      </Modal>
    </div>
  );
}

function NodeBox({
  icon, title, subtitle, online, color = '#0F766E', alignRight = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  online: boolean;
  color?: string;
  alignRight?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center ${alignRight ? 'sm:items-end' : ''} text-center`}>
      <span className="w-14 h-14 rounded-full inline-flex items-center justify-center text-white shadow-md" style={{ background: color }}>
        <Icon name={icon} size={22}/>
      </span>
      <div className="mt-2 text-[13px] font-semibold text-navy">{title}</div>
      <div className="text-[11px] text-muted">{subtitle}</div>
      <span className="pill mt-2" style={{ background: online ? '#ECFDF5' : '#F1F5F9', color: online ? '#065F46' : '#475569', opacity: online ? 1 : 0.8 }}>
        <span className="dot" style={{ background: online ? '#10B981' : '#94A3B8' }}/>{online ? 'Live' : 'Idle'}
      </span>
    </div>
  );
}

function QueueRow({
  item, onRetry, onDiscard,
}: {
  item: SyncQueueItem;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const label = TABLE_LABELS[item.tableName] ?? item.tableName;
  const icon  = TABLE_ICONS[item.tableName]  ?? 'database';
  const isFailed = item.status === 'failed';

  return (
    <li className="flex items-center gap-3 py-3">
      <span className={`w-9 h-9 rounded-md inline-flex items-center justify-center ${isFailed ? 'bg-rose-100 text-rose-700' : 'bg-primary-light text-primary'}`}>
        <Icon name={icon} size={16}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-navy truncate">
          {label} · <span className="font-mono text-[11px] text-muted">{item.recordId.slice(0, 8)}</span>
        </div>
        <div className="text-[11px] text-muted truncate">
          {item.operation} · {item.retries} {item.retries === 1 ? 'retry' : 'retries'}
          {item.lastError ? ` · ${item.lastError}` : ''}
        </div>
      </div>
      <Badge status={isFailed ? 'failed' : 'pending'}/>
      <div className="flex items-center gap-1">
        <button
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted hover:text-primary hover:bg-primary-light press"
          aria-label="Retry"
          onClick={onRetry}
        >
          <Icon name="refresh-cw" size={14}/>
        </button>
        <button
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted hover:text-rose-600 hover:bg-rose-50 press"
          aria-label="Discard"
          onClick={onDiscard}
        >
          <Icon name="trash-2" size={14}/>
        </button>
      </div>
    </li>
  );
}

function PeerRow({ peer }: { peer: LanPeer }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center flex-shrink-0">
        <Icon name="laptop" size={16}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-navy truncate">{peer.deviceName}</div>
        <div className="text-[11px] text-muted truncate">
          {ROLE_LABELS[peer.role] ?? peer.role} · joined {new Date(peer.joinedAt).toLocaleTimeString()}
        </div>
      </div>
      <span className="dot pulse-dot flex-shrink-0" style={{ background: '#10B981', width: 9, height: 9 }}/>
    </li>
  );
}

function ConflictRow({ conflict }: { conflict: ConflictRecord }) {
  const label = TABLE_LABELS[conflict.tableName] ?? conflict.tableName;
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="w-9 h-9 rounded-md bg-amber-100 text-amber-700 inline-flex items-center justify-center flex-shrink-0">
        <Icon name="alert-triangle" size={16}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-navy">
          {label} · <span className="font-mono text-[11px] text-muted">{conflict.recordId.slice(0, 8)}</span>
        </div>
        <div className="text-[11px] text-muted">
          local: {new Date(conflict.localUpdatedAt).toLocaleString()} · cloud: {new Date(conflict.serverUpdatedAt).toLocaleString()}
        </div>
      </div>
      <span className="pill text-amber-700" style={{ background: '#FEF3C7' }}>cloud is newer</span>
    </li>
  );
}
