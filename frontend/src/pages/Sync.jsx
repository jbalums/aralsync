import React, { useState, useEffect, useMemo, useRef, useCallback, Fragment } from 'react';
import {
  Icon, Avatar, Badge, QuarterBadge, Card, Modal, useToast,
  EmptyState, Skeleton, StatCard, Progress, ComponentWeightBar,
  ConnPill, Logo, Sparkbars, RingChart, Donut, HeatCalendar,
  SubjectChip, gradeColor, studentStatus, SectionHeader, Btn,
  Dropdown, Tabs, Switch, Field, TextInput, Select,
  BADGE_STYLES,
} from '../components';
import {
  TEACHER, CLASSES, STUDENTS_RIZAL, JUAN_SCORES, SUBJECT_COLORS,
  TODAY, SYNC_STATE, ACTIVITY, NOTIFICATIONS, STUDENT_NOTES,
  ATTENDANCE_LOG, SPARKLINES,
} from '../data/mockData';

// ─── SYNC CENTER ─────────────────────────────────────────

export function PageSync({ online, setOnline, pending, setPending }) {
  const [syncing, setSyncing] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const toast = useToast();

  const doSync = () => {
    if (!online) { toast.push({ type:'warning', message:'You are offline. Will sync when reconnected.' }); return; }
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setPending(0); toast.push({ type:'success', title:'Synced', message:`${pending} records uploaded to cloud.` }); }, 1600);
  };

  const storageUsedPct = (SYNC_STATE.storageUsedMB / SYNC_STATE.storageCapMB) * 100;

  return (
    <div className="page-anim space-y-5">
      {/* Connection visualizer */}
      <Card className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50"/>
        <div className="relative">
          <SectionHeader
            title="Connection map"
            subtitle="Devices, peers, and the cloud"
            right={<button onClick={() => setOnline(o => !o)}><ConnPill online={online}/></button>}
          />
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center">
            {/* Left: LAN peer */}
            <NodeBox icon="laptop" title="Sir Reyes' Laptop" subtitle="LAN peer · same WiFi" online={true} color="#6366F1"/>

            {/* Center: this device with arrows */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 240 80" className="w-full max-w-[260px]">
                {/* left dashed */}
                <line x1="10" y1="40" x2="100" y2="40" stroke="#6366F1" strokeWidth="2.4" className="dash-anim" />
                {/* right dashed */}
                <line x1="140" y1="40" x2="230" y2="40" stroke={online?'#10B981':'#94A3B8'} strokeWidth="2.4" className={online?'dash-anim':''}/>
                {/* center circle */}
                <circle cx="120" cy="40" r="22" fill="#0F766E"/>
                <text x="120" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{pending}</text>
              </svg>
              <div className="mt-2 text-[13px] font-semibold text-navy text-center">{TEACHER.device}</div>
              <div className="text-[11px] text-muted text-center">This device · {SYNC_STATE.storageUsedMB} MB stored</div>
              <div className="mt-3 flex items-center gap-2">
                <Btn variant="primary" size="sm" icon={syncing? 'loader-2':'cloud-upload'} onClick={doSync} disabled={!pending || syncing} className={syncing?'opacity-90':''}>
                  {syncing? 'Syncing…' : pending? `Sync ${pending} now` : 'Up to date'}
                </Btn>
              </div>
            </div>

            {/* Right: cloud */}
            <NodeBox icon={online?'cloud':'cloud-off'} title="DepEd Cloud" subtitle={online?'Connected · auto-sync':'Unreachable · queued'} online={online} color={online?'#10B981':'#94A3B8'} alignRight/>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending queue */}
        <Card className="p-5">
          <SectionHeader title="Pending queue" subtitle={pending? `${pending} record${pending>1?'s':''} ready to upload` : 'Nothing pending — you are all caught up'}
            right={pending? <Btn size="sm" variant="primary" icon={syncing?'loader-2':'cloud-upload'} onClick={doSync}>{syncing?'Syncing…':'Sync now'}</Btn> : null}/>
          {pending === 0 ? (
            <EmptyState icon="check-circle" title="All synced" description="Records will appear here when you make changes offline."/>
          ) : (
            <ul className="divide-y divide-line">
              {SYNC_STATE.queue.map((q,i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className={`w-9 h-9 rounded-md inline-flex items-center justify-center ${q.kind==='attendance'?'bg-primary-light text-primary':'bg-emerald-100 text-emerald-700'}`}>
                    <Icon name={q.kind==='attendance'?'clipboard-check':'pencil-line'} size={16}/>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-navy truncate">{q.label}</div>
                    <div className="text-[11px] text-muted">{q.records} record{q.records>1?'s':''} · queued just now</div>
                  </div>
                  <Badge status="pending"/>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 pt-3 border-t border-line flex items-center justify-between text-[12px] text-muted">
            <span>Retries: <span className="text-navy font-semibold">2</span> failed earlier</span>
            <Btn variant="ghost" size="sm" icon="rotate-cw">Retry failed</Btn>
          </div>
        </Card>

        {/* Sync log */}
        <Card className="p-5">
          <SectionHeader title="Sync log" subtitle="Last 10 events"/>
          <ul className="space-y-2">
            {SYNC_STATE.log.map((e,i) => (
              <li key={i} className="flex items-center gap-3 text-[12.5px] py-1.5 border-b border-line/60 last:border-0">
                <span className={`w-6 h-6 rounded-md inline-flex items-center justify-center ${e.ok?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>
                  <Icon name={e.ok?'check':'x'} size={12}/>
                </span>
                <span className={`flex-1 ${e.ok?'text-navy':'text-rose-700'}`}>{e.label}</span>
                <span className="text-muted">{e.when}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Devices */}
        <Card className="p-5">
          <SectionHeader title="Connected devices"
            right={<Btn size="sm" variant="secondary" icon="plus" onClick={() => setPairOpen(true)}>Pair new</Btn>}/>
          <ul className="divide-y divide-line">
            {SYNC_STATE.devices.map((d,i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className="w-10 h-10 rounded-md bg-surface inline-flex items-center justify-center">
                  <Icon name={d.role==='This device'?'tablet':d.role==='Cloud'?'cloud':'laptop'} size={18} className="text-navy/70"/>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-navy">{d.name} {d.role==='This device' && <Badge status="primary">This device</Badge>}</div>
                  <div className="text-[11px] text-muted">{d.role} · last seen {d.last}{d.size!=='—'?` · ${d.size}`:''}</div>
                </div>
                <Badge status={d.online?'synced':'pending'}/>
              </li>
            ))}
          </ul>
        </Card>

        {/* Storage */}
        <Card className="p-5">
          <SectionHeader title="Local storage" subtitle={`${SYNC_STATE.storageUsedMB} MB used · ${(SYNC_STATE.storageCapMB/1024).toFixed(0)} GB cap`}/>
          <div className="rounded-md border border-line p-3">
            <div className="flex items-end gap-3 mb-2">
              <div className="text-[26px] font-semibold text-navy font-mono leading-none">{SYNC_STATE.storageUsedMB}<span className="text-[14px] text-muted"> MB</span></div>
              <div className="text-[11px] text-muted">{storageUsedPct.toFixed(1)}% of {(SYNC_STATE.storageCapMB/1024).toFixed(0)} GB</div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-slate-100 flex">
              <div style={{ width:`${(SYNC_STATE.storageBreakdown.attendance/SYNC_STATE.storageCapMB)*100}%`, background:'#0F766E' }}/>
              <div style={{ width:`${(SYNC_STATE.storageBreakdown.grades/SYNC_STATE.storageCapMB)*100}%`, background:'#10B981' }}/>
              <div style={{ width:`${(SYNC_STATE.storageBreakdown.other/SYNC_STATE.storageCapMB)*100}%`, background:'#6366F1' }}/>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary"/>Attendance · 28 MB</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"/>Grades · 11 MB</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"/>Other · 3.3 MB</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="archive">Export backup .zip</Btn>
            <Btn variant="ghost" size="sm" icon="trash-2">Clear cache</Btn>
          </div>
        </Card>
      </div>

      <Modal open={pairOpen} onClose={() => setPairOpen(false)} title="Pair new device"
        subtitle="Open AralSync on the second device and scan this code"
        footer={<>
          <Btn variant="ghost" onClick={() => setPairOpen(false)}>Cancel</Btn>
          <Btn variant="primary" icon="refresh-cw" onClick={() => toast.push({ message:'New pairing code generated' })}>Refresh code</Btn>
        </>}>
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5 items-start">
          <div className="rounded-md border-2 border-line p-3 bg-white">
            <QRPlaceholder/>
            <div className="text-center text-[11px] font-mono text-muted mt-2">code · ARAL-7QF-921</div>
          </div>
          <div className="space-y-2 text-[12.5px] text-navy">
            <div className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary text-white inline-flex items-center justify-center text-[10px] font-bold">1</span> Open AralSync on the other device.</div>
            <div className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary text-white inline-flex items-center justify-center text-[10px] font-bold">2</span> Tap <span className="font-semibold">Pair device</span>, then scan this code.</div>
            <div className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-primary text-white inline-flex items-center justify-center text-[10px] font-bold">3</span> Wait for the green check on both devices.</div>
            <div className="mt-3 rounded-md bg-amber-50 text-amber-800 p-2 text-[12px] flex items-center gap-2"><Icon name="shield-check" size={14}/> Only pair devices you own. LAN sync uses end-to-end encryption.</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function NodeBox({ icon, title, subtitle, online, color='#0F766E', alignRight }) {
  return (
    <div className={`flex flex-col items-center ${alignRight?'sm:items-end':''} text-center`}>
      <span className="w-14 h-14 rounded-full inline-flex items-center justify-center text-white shadow-md" style={{background:color}}>
        <Icon name={icon} size={22}/>
      </span>
      <div className="mt-2 text-[13px] font-semibold text-navy">{title}</div>
      <div className="text-[11px] text-muted">{subtitle}</div>
      <span className={`pill mt-2 ${online?'':'opacity-80'}`} style={{background: online?'#ECFDF5':'#F1F5F9', color: online?'#065F46':'#475569'}}>
        <span className="dot" style={{background: online?'#10B981':'#94A3B8'}}/>{online?'Live':'Idle'}
      </span>
    </div>
  );
}

function QRPlaceholder() {
  // Decorative QR-like grid
  const cells = [];
  const rand = (x,y) => ((x*73 + y*131 + 17) % 7) > 2;
  for (let y = 0; y < 25; y++)
    for (let x = 0; x < 25; x++) {
      // corner finder boxes
      const corner = (x<7 && y<7) || (x>17 && y<7) || (x<7 && y>17);
      let on = corner || rand(x,y);
      // hollow centers of finders
      if ((x>1 && x<5 && y>1 && y<5) || (x>19 && x<23 && y>1 && y<5) || (x>1 && x<5 && y>19 && y<23)) on = false;
      if ((x===2 || x===4) && (y===2 || y===4)) on = true;
      cells.push(<rect key={`${x}-${y}`} x={x*6} y={y*6} width={5.6} height={5.6} fill={on?'#0F172A':'transparent'}/>);
    }
  return (
    <svg viewBox="0 0 150 150" className="w-full">{cells}</svg>
  );
}

