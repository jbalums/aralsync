// @ts-nocheck
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

// ─── SETTINGS ────────────────────────────────────────────

export function PageSettings() {
  const [sub, setSub] = useState('profile');
  const [autosync, setAutosync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [bgSync, setBgSync] = useState(false);
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [interval, setInterval] = useState('5');
  const [clearOpen, setClearOpen] = useState(false);
  const toast = useToast();

  const nav = [
    { id:'profile',   label:'Profile',         icon:'user' },
    { id:'school',    label:'School info',     icon:'building-2' },
    { id:'grading',   label:'Grading config',  icon:'graduation-cap' },
    { id:'sync',      label:'Sync preferences',icon:'refresh-cw' },
    { id:'storage',   label:'Storage & data',  icon:'hard-drive' },
    { id:'notif',     label:'Notifications',   icon:'bell' },
    { id:'devices',   label:'Devices',         icon:'tablet' },
    { id:'about',     label:'About',           icon:'info' },
  ];

  return (
    <div className="page-anim grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
      {/* Sub-nav */}
      <Card className="p-2 self-start sticky lg:top-20 max-h-[calc(100vh-96px)] overflow-y-auto">
        {nav.map(n => {
          const active = sub === n.id;
          return (
            <button key={n.id} onClick={() => setSub(n.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[13px] font-medium tx ${active?'bg-primary-light/70 text-primary-dark':'text-navy/80 hover:bg-slate-50'}`}>
              <Icon name={n.icon} size={15} className={active?'text-primary':'text-muted'}/>
              <span>{n.label}</span>
            </button>
          );
        })}
      </Card>

      <div className="space-y-5">
        {sub === 'profile' && (
          <Card className="p-5">
            <SectionHeader title="Profile" subtitle="How you appear in reports and to other teachers"/>
            <div className="flex items-start gap-4 flex-wrap">
              <Avatar name={TEACHER.name} size="xl"/>
              <div className="flex-1 min-w-[260px] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full name" required><TextInput defaultValue={TEACHER.name}/></Field>
                <Field label="Email"><TextInput defaultValue={TEACHER.email}/></Field>
                <Field label="Position"><TextInput defaultValue={TEACHER.position.split(' · ')[0]}/></Field>
                <Field label="Employee number"><TextInput defaultValue={TEACHER.employeeNo}/></Field>
                <Field label="Mobile contact"><TextInput placeholder="+63 …"/></Field>
                <Field label="Adviser role"><TextInput defaultValue="Grade 7 Adviser"/></Field>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Btn variant="ghost">Discard</Btn>
              <Btn variant="primary" icon="save" onClick={() => toast.push({ type:'success', message:'Profile updated locally · will sync.' })}>Save changes</Btn>
            </div>
          </Card>
        )}

        {sub === 'school' && (
          <Card className="p-5">
            <SectionHeader title="School information" subtitle="Used on SF2 / SF9 forms"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="School name"><TextInput defaultValue={TEACHER.school}/></Field>
              <Field label="School ID"><TextInput defaultValue="301045"/></Field>
              <Field label="Division"><TextInput defaultValue={TEACHER.division}/></Field>
              <Field label="District"><TextInput defaultValue={TEACHER.district}/></Field>
              <Field label="Active school year"><TextInput defaultValue={TEACHER.schoolYear}/></Field>
              <Field label="Current quarter"><Select defaultValue={TEACHER.quarter}><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></Select></Field>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Btn variant="ghost">Discard</Btn>
              <Btn variant="primary" icon="save">Save</Btn>
            </div>
          </Card>
        )}

        {sub === 'grading' && (
          <Card className="p-5">
            <SectionHeader title="Grading configuration" subtitle="DepEd component weights · per subject"/>
            <div className="overflow-hidden rounded-md border border-line">
              <table className="w-full text-[13px]">
                <thead className="bg-surface text-muted text-left">
                  <tr><th className="px-3 py-2 font-semibold">Subject</th><th className="px-3 py-2 font-semibold">WW</th><th className="px-3 py-2 font-semibold">PT</th><th className="px-3 py-2 font-semibold">QA</th><th className="px-3 py-2 font-semibold">Total</th></tr>
                </thead>
                <tbody>
                  {CLASSES.map(c => {
                    const t = c.weights.ww + c.weights.pt + c.weights.qa;
                    return (
                      <tr key={c.id} className="border-t border-line">
                        <td className="px-3 py-2"><div className="flex items-center gap-2"><SubjectChip subject={c.subject}/><span className="text-muted text-[11px]">{c.grade} · {c.section}</span></div></td>
                        <td className="px-3 py-2"><span className="font-mono">{c.weights.ww}%</span></td>
                        <td className="px-3 py-2"><span className="font-mono">{c.weights.pt}%</span></td>
                        <td className="px-3 py-2"><span className="font-mono">{c.weights.qa}%</span></td>
                        <td className="px-3 py-2"><Badge status={t===100?'synced':'pending'}>{t}%</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-4 bg-surface/70">
                <div className="text-[12px] font-semibold text-navy">DepEd default preset</div>
                <div className="text-[11.5px] text-muted mt-1">WW 20% · PT 60% · QA 20%</div>
                <ComponentWeightBar ww={20} pt={60} qa={20} className="mt-2"/>
              </Card>
              <Card className="p-4 bg-surface/70">
                <div className="text-[12px] font-semibold text-navy">Language preset</div>
                <div className="text-[11.5px] text-muted mt-1">WW 25% · PT 50% · QA 25%</div>
                <ComponentWeightBar ww={25} pt={50} qa={25} className="mt-2"/>
              </Card>
            </div>
            <Switch value={true} onChange={()=>{}} label="Show transmutation table on grade entry"
              hint="Helpful when computing raw → transmuted scores during grading."/>
          </Card>
        )}

        {sub === 'sync' && (
          <Card className="p-5">
            <SectionHeader title="Sync preferences" subtitle="When and how AralSync uploads"/>
            <div className="space-y-1.5 divide-y divide-line">
              <Switch value={autosync} onChange={setAutosync} label="Auto-sync" hint="Upload pending records as soon as you regain connection."/>
              <div className="pt-3 pb-2 flex items-center justify-between gap-3">
                <div><div className="text-[13.5px] font-medium text-navy">Sync interval</div><div className="text-[12px] text-muted">How often AralSync checks for new records.</div></div>
                <Select value={interval} onChange={(e)=>setInterval(e.target.value)} className="!h-9 max-w-[160px]">
                  <option value="1">Every 1 minute</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="manual">Manual only</option>
                </Select>
              </div>
              <Switch value={wifiOnly} onChange={setWifiOnly} label="WiFi only" hint="Pause sync over mobile data to save load allowance."/>
              <Switch value={bgSync} onChange={setBgSync} label="Background sync" hint="Continue syncing when app is backgrounded."/>
            </div>
          </Card>
        )}

        {sub === 'storage' && (
          <div className="space-y-5">
            <Card className="p-5">
              <SectionHeader title="Storage usage"/>
              <div className="text-[26px] font-semibold text-navy font-mono leading-none">{SYNC_STATE.storageUsedMB}<span className="text-[14px] text-muted"> MB / 2 GB</span></div>
              <div className="mt-3 h-2 rounded-full overflow-hidden bg-slate-100 flex">
                <div style={{ width:'1.4%',  background:'#0F766E' }}/>
                <div style={{ width:'0.55%', background:'#10B981' }}/>
                <div style={{ width:'0.18%', background:'#6366F1' }}/>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary"/>Attendance · 28 MB</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"/>Grades · 11 MB</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"/>Other · 3.3 MB</span>
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Backups & data" subtitle="Schedule automatic exports"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Auto-backup schedule">
                  <Select defaultValue="weekly"><option>Daily at 6pm</option><option value="weekly">Weekly on Sunday</option><option>Manual only</option></Select>
                </Field>
                <Field label="Backup destination">
                  <Select><option>This device</option><option>USB drive</option><option>DepEd Cloud</option></Select>
                </Field>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Btn variant="secondary" icon="archive">Export all data (.zip)</Btn>
                <Btn variant="ghost" icon="trash-2" onClick={() => setClearOpen(true)}>Clear local cache</Btn>
              </div>
            </Card>
          </div>
        )}

        {sub === 'notif' && (
          <Card className="p-5">
            <SectionHeader title="Notifications" subtitle="What you want to be alerted about"/>
            <div className="divide-y divide-line">
              <Switch value={notif1} onChange={setNotif1} label="Sync complete" hint="When records have finished uploading."/>
              <Switch value={notif2} onChange={setNotif2} label="Sync failed" hint="If a sync didn't complete for any reason."/>
              <Switch value={notif3} onChange={setNotif3} label="Pending records reminder" hint="Periodic nudge when records sit in queue for >24h."/>
            </div>
          </Card>
        )}

        {sub === 'devices' && (
          <Card className="p-5">
            <SectionHeader title="Devices" subtitle="Paired with your account"
              right={<Btn size="sm" variant="primary" icon="plus">Pair new</Btn>}/>
            <ul className="divide-y divide-line">
              {SYNC_STATE.devices.map((d,i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="w-10 h-10 rounded-md bg-surface inline-flex items-center justify-center">
                    <Icon name={d.role==='This device'?'tablet':d.role==='Cloud'?'cloud':'laptop'} size={18} className="text-navy/70"/>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-navy">{d.name}</div>
                    <div className="text-[11px] text-muted">{d.role} · last seen {d.last}</div>
                  </div>
                  {d.role !== 'This device' && <Btn variant="ghost" size="sm" icon="x">Revoke</Btn>}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {sub === 'about' && (
          <Card className="p-5">
            <SectionHeader title="About AralSync"/>
            <div className="flex items-start gap-4">
              <Logo size={20}/>
              <div className="flex-1">
                <div className="text-[13px] text-muted">v1.0.0 · Beta</div>
                <p className="text-[13px] text-navy mt-2 max-w-md leading-relaxed">
                  Built for Philippine public school teachers. Designed to keep classroom records flowing - even on patchy connections - and to align with the DepEd grading framework out of the box.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Btn variant="secondary" size="sm" icon="git-commit">View changelog</Btn>
                  <Btn variant="ghost" size="sm" icon="message-square">Send feedback</Btn>
                </div>
                <div className="mt-4 text-[11px] text-muted">© 2024–2025 AralSync · Teach more. Sync seamlessly.</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal open={clearOpen} onClose={() => setClearOpen(false)} title="Clear local cache?" subtitle="Pending records will be lost. Synced data on the cloud stays."
        footer={<>
          <Btn variant="ghost" onClick={() => setClearOpen(false)}>Cancel</Btn>
          <Btn variant="danger" icon="trash-2" onClick={() => { setClearOpen(false); toast.push({ type:'warning', title:'Cache cleared', message:'42.3 MB freed locally.' }); }}>Yes, clear cache</Btn>
        </>}>
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-[12.5px] text-rose-800 flex items-start gap-2">
          <Icon name="alert-triangle" size={14}/> <span><span className="font-semibold">3 records are still pending sync.</span> Clearing the cache will discard them. Sync first if you need to keep them.</span>
        </div>
      </Modal>
    </div>
  );
}

