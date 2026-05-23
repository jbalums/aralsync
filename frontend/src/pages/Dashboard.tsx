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

// ─── DASHBOARD ───────────────────────────────────────────

export function PageDashboard({ online, pending, setRoute, setSelectedClass, openAttendance }) {
  const totalStudents = CLASSES.reduce((a,c)=>a+c.count,0);
  const todayPresent = 155, todayTotal = 165;
  const present = 92, late = 4, absent = 3, excused = 1; // percent
  const toast = useToast();

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-anim space-y-5">
      {/* HERO */}
      <Card className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60"/>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[12px] font-semibold text-primary uppercase tracking-[0.16em]">{TODAY.weekday} · {TEACHER.quarter} {TEACHER.week} · {TODAY.dateLabel}</div>
            <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-navy mt-1.5">{greet()}, {TEACHER.shortName}.</h2>
            <p className="text-[14px] text-muted mt-1.5 max-w-xl">You're teaching {CLASSES.length} classes today across {totalStudents} students. Your next session starts in <span className="text-navy font-semibold">12 minutes</span> in <span className="text-navy font-semibold">Room 106</span>.</p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Btn variant="primary" icon="clipboard-check" onClick={openAttendance}>Take attendance now</Btn>
              <Btn variant="secondary" icon="graduation-cap" onClick={() => setRoute('gradebook')}>Continue grading</Btn>
              <span className="hidden sm:inline-flex items-center text-[12px] text-muted ml-2">
                <Icon name="info" size={13} className="mr-1"/> Tip: press <kbd className="mx-1 px-1.5 py-0.5 rounded border border-line bg-white text-[10px] font-mono">P</kbd> on any student row to mark present.
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2.5">
            <Badge status="primary"><Icon name="cloud" size={12}/> {online ? 'Online · auto-syncing' : 'Offline · saving locally'}</Badge>
            <Card variant="elevated" className="px-4 py-3 flex items-center gap-3 bg-white/95 backdrop-blur">
              <span className="w-10 h-10 rounded-md bg-primary text-white inline-flex items-center justify-center">
                <Icon name="refresh-cw" size={18} className={pending? 'spin-slow':''}/>
              </span>
              <div>
                <div className="text-[12px] text-muted">Last sync</div>
                <div className="text-[14px] font-semibold text-navy">{SYNC_STATE.lastSync}</div>
              </div>
              <span className="w-px h-8 bg-line mx-1"/>
              <div>
                <div className="text-[12px] text-muted">Pending</div>
                <div className="text-[14px] font-semibold text-amber-600">{pending} records</div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* STAT ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="users" label="Students today" value={`${todayPresent}/${todayTotal}`} trend="+1.4%" color="primary" sub="Across 4 sections"/>
        <StatCard icon="check-circle" label="Avg attendance" value="92.6%" trend="+0.3%" color="accent" sub="Q3 to date"/>
        <StatCard icon="graduation-cap" label="Avg grade" value="85.3" trend="-0.4%" color="blue" sub="Quarterly · 4 classes"/>
        <StatCard icon="cloud-off" label="Pending sync" value={pending} color="amber" sub={online?'Will sync shortly':'Working offline'}/>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 p-5">
          <SectionHeader
            title="Today's Schedule"
            subtitle={`${TODAY.weekday}, ${TODAY.dateLabel}`}
            right={<Btn size="sm" variant="ghost" iconRight="arrow-right" onClick={() => setRoute('classes')}>Manage classes</Btn>}
          />
          <div className="flex flex-col">
            {TODAY.schedule.map((s, i) => {
              const c = SUBJECT_COLORS[s.subject];
              const isCurrent = s.status === 'current';
              const isDone = s.status === 'done';
              return (
                <div key={i} className={`flex items-stretch gap-4 py-3.5 ${i>0?'border-t border-line':''} ${isCurrent? 'bg-primary-light/30 -mx-5 px-5':''} relative`}>
                  {isCurrent && <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-primary"></span>}
                  <div className="w-[80px] shrink-0 flex flex-col items-start justify-center">
                    <div className="text-[12px] font-mono font-semibold text-navy tracking-tight">{s.time.split('–')[0]}</div>
                    <div className="text-[10px] text-muted">to {s.time.split('–')[1]}</div>
                  </div>
                  <span className="w-1 rounded-full" style={{background:c.hue}}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SubjectChip subject={s.subject}/>
                      {isCurrent && <span className="pill" style={{background:'#FFFBEB', color:'#92400E'}}><span className="dot bg-amber-500 pulse-dot"/>In progress</span>}
                      {isDone && <span className="pill" style={{background:'#ECFDF5', color:'#065F46'}}><span className="dot bg-emerald-500"/>Attendance saved</span>}
                    </div>
                    <div className="text-[14px] font-semibold text-navy mt-1.5">{s.section}</div>
                    <div className="text-[12px] text-muted flex items-center gap-1 mt-0.5"><Icon name="map-pin" size={12}/>{s.room}</div>
                  </div>
                  <div className="hidden sm:flex items-center">
                    {isDone ? (
                      <Btn variant="ghost" size="sm" icon="eye" onClick={() => { setSelectedClass(s.classId); setRoute('class-detail'); }}>View</Btn>
                    ) : (
                      <Btn variant={isCurrent?'primary':'secondary'} size="sm" icon="clipboard-check" onClick={() => { setSelectedClass(s.classId); openAttendance(); }}>Take attendance</Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quarter Summary */}
        <Card className="p-5">
          <SectionHeader title="Today's Attendance" subtitle="All sections, combined"/>
          <div className="flex items-center gap-4">
            <RingChart percent={(todayPresent/todayTotal)*100} size={130} color="#0F766E" label="Present"/>
            <div className="flex-1 space-y-2.5">
              {[
                { k:'present', v: present },
                { k:'late',    v: late },
                { k:'absent',  v: absent },
                { k:'excused', v: excused },
              ].map((r,i) => {
                const s = BADGE_STYLES[r.k];
                return (
                  <div key={i} className="flex items-center gap-2 text-[12.5px]">
                    <span className="dot" style={{background:s.dot, width:9, height:9}}/>
                    <span className="text-navy font-medium flex-1 capitalize">{r.k}</span>
                    <span className="font-mono font-semibold text-navy">{r.v}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[12px] text-muted mt-4 text-center bg-surface rounded-md py-2">
            <span className="font-semibold text-navy">{todayPresent} of {todayTotal}</span> students present today
          </div>
        </Card>

        {/* Sync card */}
        <Card className="p-5 lg:col-span-1">
          <SectionHeader title="Sync Status" right={<Badge status={online?'synced':'pending'}>{online?'Connected':'Offline'}</Badge>} />
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${online && pending? 'bg-primary':'bg-amber-500'}`}>
              <Icon name={online?'refresh-cw':'cloud-off'} size={28} className={online && pending? 'spin-slow':''}/>
            </div>
            <div>
              <div className="text-[24px] font-semibold text-navy leading-none">{pending}</div>
              <div className="text-[12px] text-muted mt-1">records pending</div>
              <div className="text-[12px] text-muted">Last sync · {SYNC_STATE.lastSync}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted">
            <span className="pill" style={{background:'#F1F5F9', color:'#334155'}}>
              <Icon name="tablet" size={10}/> {TEACHER.device}
            </span>
            <span className="pill" style={{background:'#EDE9FE', color:'#4C1D95'}}>
              <Icon name="wifi" size={10}/> 1 LAN peer
            </span>
          </div>
          <Btn variant={online?'primary':'soft'} className="w-full mt-4" icon="cloud-upload" onClick={() => toast.push({ type:'success', title:'Sync started', message: `Uploading ${pending} pending records…` })}>{online? 'Sync Now':'Will sync when online'}</Btn>
        </Card>

        {/* Gradebook progress */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Gradebook Progress" subtitle={`${TEACHER.quarter} · component entries completed`}
            right={<Btn size="sm" variant="ghost" iconRight="arrow-right" onClick={() => setRoute('gradebook')}>Open gradebook</Btn>}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLASSES.map(c => {
              const wwPct = (c.prog.ww[0]/c.prog.ww[1])*100;
              const ptPct = (c.prog.pt[0]/c.prog.pt[1])*100;
              const qaPct = (c.prog.qa[0]/c.prog.qa[1])*100;
              return (
                <div key={c.id} className="border border-line rounded-md p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <SubjectChip subject={c.subject}/>
                    <span className="text-[12px] text-muted">{c.grade} · {c.section}</span>
                  </div>
                  {[
                    { label:'WW', n:c.prog.ww, pct:wwPct, color:'bg-teal-500' },
                    { label:'PT', n:c.prog.pt, pct:ptPct, color:'bg-emerald-500' },
                    { label:'QA', n:c.prog.qa, pct:qaPct, color:'bg-indigo-500' },
                  ].map((row,i) => (
                    <div key={i} className="flex items-center gap-2 mb-1.5 last:mb-0">
                      <span className="w-7 text-[11px] font-semibold text-muted">{row.label}</span>
                      <Progress value={row.pct} className="flex-1" barClass={row.color}/>
                      <span className="text-[11px] font-mono text-muted w-10 text-right">{row.n[0]}/{row.n[1]}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <SectionHeader title="Recent Activity"/>
          <div className="space-y-3">
            {ACTIVITY.slice(0,6).map((a,i) => {
              const tones = { primary:'bg-primary-light text-primary', accent:'bg-emerald-100 text-emerald-700', warning:'bg-amber-100 text-amber-700', muted:'bg-slate-100 text-slate-600' };
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className={`w-7 h-7 shrink-0 rounded-md inline-flex items-center justify-center ${tones[a.tone]||tones.muted}`}>
                    <Icon name={a.icon} size={14}/>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-navy">{a.text}</div>
                    <div className="text-[11px] text-muted mt-0.5">{a.when}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Class performance sparklines */}
        <Card className="p-5 lg:col-span-3">
          <SectionHeader title="Class performance - last 4 weeks"
            subtitle="Attendance trend per class"
            right={
              <div className="flex items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-400"/> Prior weeks</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary"/> Latest</span>
              </div>
            }/>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CLASSES.map(c => (
              <div key={c.id} className="rounded-md border border-line p-3.5 hover:shadow-md tx cursor-pointer" onClick={() => { setSelectedClass(c.id); setRoute('class-detail'); }}>
                <div className="flex items-center justify-between">
                  <SubjectChip subject={c.subject}/>
                  <span className="text-[13px] font-semibold text-navy font-mono">{c.att}%</span>
                </div>
                <div className="text-[12px] text-muted mt-1">{c.grade} · {c.section}</div>
                <div className="mt-3 flex items-end justify-between">
                  <Sparkbars values={SPARKLINES[c.id]} height={30}/>
                  <div className="text-right">
                    <div className="text-[10px] text-muted uppercase tracking-wider">avg gr.</div>
                    <div className="text-[14px] font-semibold text-navy">{c.avgGrade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

