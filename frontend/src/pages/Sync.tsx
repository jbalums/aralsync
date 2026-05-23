// @ts-nocheck
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Icon, Card, SectionHeader, Btn, EmptyState, useToast,
  ConnPill, Badge,
} from '../components';
import { useSyncStore } from '../modules/sync/syncStore';
import { syncApiService } from '../modules/sync/sync.service';
import { drainQueue } from '../offline/backgroundSync';
import { db } from '../db';

// ─── SYNC CENTER ─────────────────────────────────────────

export function PageSync() {
  const { isOnline, queueCount, connectionMode, lastSyncAt, lanPeers } = useSyncStore();
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  const { data: syncStatus } = useQuery({
    queryKey: ['sync', 'status'],
    queryFn: () => syncApiService.getStatus(),
    refetchInterval: 30_000,
    enabled: isOnline,
  });

  const { data: syncLogs = [] } = useQuery({
    queryKey: ['sync', 'logs'],
    queryFn: () => syncApiService.getLogs(),
    refetchInterval: 60_000,
    enabled: isOnline,
  });

  const { data: queueItems = [] } = useQuery({
    queryKey: ['sync', 'queue-items'],
    queryFn: async () => {
      const items = await db.syncQueue.toArray();
      const grouped: Record<string, { count: number; retried: number }> = {};
      for (const item of items) {
        const g = grouped[item.tableName] ?? { count: 0, retried: 0 };
        g.count++;
        if ((item.retries ?? 0) > 0) g.retried++;
        grouped[item.tableName] = g;
      }
      return Object.entries(grouped).map(([tableName, g]) => ({ tableName, ...g }));
    },
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

  const doSync = useCallback(async () => {
    if (!isOnline) {
      toast.push({ type: 'warning', message: 'You are offline. Will sync when reconnected.' });
      return;
    }
    setSyncing(true);
    try {
      await drainQueue();
      toast.push({ type: 'success', title: 'Synced', message: 'Queue drained successfully.' });
    } catch {
      toast.push({ type: 'error', message: 'Sync failed. Will retry automatically.' });
    } finally {
      setSyncing(false);
    }
  }, [isOnline, toast]);

  const displayLastSync = syncStatus?.lastSyncAt ?? lastSyncAt;
  const lastSyncLabel = displayLastSync
    ? new Date(displayLastSync).toLocaleString()
    : 'Never';

  const modeLabel = connectionMode === 'lan' ? 'LAN mode' : connectionMode === 'cloud' ? 'Cloud mode' : 'Offline';

  return (
    <div className="page-anim space-y-5">
      {/* Connection map */}
      <Card className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50"/>
        <div className="relative">
          <SectionHeader
            title="Connection map"
            subtitle="Devices, peers, and the cloud"
            right={<ConnPill online={isOnline}/>}
          />
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center">
            <NodeBox
              icon="laptop"
              title={lanPeers > 0 ? `${lanPeers} LAN peer${lanPeers !== 1 ? 's' : ''}` : 'No LAN peers'}
              subtitle={lanPeers > 0 ? 'Same WiFi · syncing' : 'No peers detected'}
              online={lanPeers > 0}
              color="#6366F1"
            />

            <div className="flex flex-col items-center">
              <svg viewBox="0 0 240 80" className="w-full max-w-[260px]">
                <line x1="10" y1="40" x2="100" y2="40" stroke="#6366F1" strokeWidth="2.4"
                  strokeDasharray={lanPeers > 0 ? '6 4' : '4 4'}
                  className={lanPeers > 0 ? 'dash-anim' : ''}/>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending queue */}
        <Card className="p-5">
          <SectionHeader
            title="Pending queue"
            subtitle={queueCount
              ? `${queueCount} record${queueCount > 1 ? 's' : ''} ready to upload`
              : 'Nothing pending — you are all caught up'}
            right={queueCount
              ? <Btn size="sm" variant="primary" icon={syncing ? 'loader-2' : 'cloud-upload'} onClick={doSync} disabled={!isOnline || syncing}>{syncing ? 'Syncing…' : 'Sync now'}</Btn>
              : null}
          />
          {queueItems.length === 0 ? (
            <EmptyState icon="check-circle" title="All synced" description="Records will appear here when you make changes offline."/>
          ) : (
            <ul className="divide-y divide-line">
              {queueItems.map(({ tableName, count, retried }) => (
                <li key={tableName} className="flex items-center gap-3 py-3">
                  <span className={`w-9 h-9 rounded-md inline-flex items-center justify-center ${tableName === 'attendanceRecords' ? 'bg-primary-light text-primary' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Icon name={tableName === 'attendanceRecords' ? 'clipboard-check' : 'pencil-line'} size={16}/>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-navy truncate">
                      {tableName === 'attendanceRecords' ? 'Attendance records'
                        : tableName === 'gradeEntries' ? 'Grade entries'
                        : tableName}
                    </div>
                    <div className="text-[11px] text-muted">
                      {count} record{count > 1 ? 's' : ''} · queued
                      {retried > 0 ? ` · ${retried} retried` : ''}
                    </div>
                  </div>
                  <Badge status="pending"/>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Sync log */}
        <Card className="p-5">
          <SectionHeader title="Sync log" subtitle="Last 20 events"/>
          {syncLogs.length === 0 ? (
            <EmptyState icon="clock" title="No sync history" description="Sync events will appear here once you connect."/>
          ) : (
            <ul className="space-y-1">
              {syncLogs.map(entry => (
                <li key={entry.id} className="flex items-center gap-3 text-[12.5px] py-1.5 border-b border-line/60 last:border-0">
                  <span className={`w-6 h-6 rounded-md inline-flex items-center justify-center flex-shrink-0 ${entry.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    <Icon name={entry.status === 'success' ? 'check' : 'x'} size={12}/>
                  </span>
                  <span className={`flex-1 truncate ${entry.status === 'success' ? 'text-navy' : 'text-rose-700'}`}>
                    {entry.type === 'push' ? '↑ Push' : '↓ Pull'} · {entry.recordCount} record{entry.recordCount !== 1 ? 's' : ''}
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
            subtitle={lanPeers > 0 ? `${lanPeers} device${lanPeers !== 1 ? 's' : ''} on the same network` : 'No peers on this network'}
          />
          {lanPeers === 0 ? (
            <EmptyState icon="wifi-off" title="No peers detected" description="Other AralSync devices on the same WiFi will appear here automatically."/>
          ) : (
            <div className="rounded-md bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-500 text-white inline-flex items-center justify-center flex-shrink-0">
                <Icon name="wifi" size={18}/>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-emerald-900">{lanPeers} peer{lanPeers !== 1 ? 's' : ''} connected</div>
                <div className="text-[11px] text-emerald-700">LAN sync active — changes propagate instantly</div>
              </div>
              <span className="dot pulse-dot flex-shrink-0" style={{ background: '#10B981', width: 9, height: 9 }}/>
            </div>
          )}
        </Card>

        {/* Storage */}
        <Card className="p-5">
          <SectionHeader
            title="Local storage"
            subtitle={storage ? `${storage.usedMB} MB used · ${storage.totalGB} GB quota` : 'Estimating…'}
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
    </div>
  );
}

function NodeBox({ icon, title, subtitle, online, color = '#0F766E', alignRight = false }) {
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
