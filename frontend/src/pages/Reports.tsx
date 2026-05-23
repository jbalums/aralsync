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

// ─── REPORTS ─────────────────────────────────────────────

export function PageReports() {
  const [previewing, setPreviewing] = useState(null);
  const toast = useToast();

  const reports = [
    {
      id:'sf2',
      code:'SF2',
      title:'Daily Attendance Record',
      desc:"Official DepEd monthly attendance form, per class. Captures daily check-ins and totals.",
      formats:['PDF','Excel','Print'],
      icon:'clipboard-list',
      tone:'primary',
      lastGen:'Today · 7:50 AM',
      note:'Generates the full month grid expected by the Division.',
    },
    {
      id:'sf9',
      code:'SF9',
      title:'Report Card',
      desc:'Per-student quarterly grades across all subjects, ready for parent distribution.',
      formats:['PDF','Print'],
      icon:'file-text',
      tone:'accent',
      lastGen:'Yesterday · 4:20 PM',
      note:'Requires coordinator to finalize multi-subject totals.',
    },
    {
      id:'gs',
      code:'',
      title:'Class Grade Summary',
      desc:'All students · all components (WW · PT · QA) with final quarterly grades.',
      formats:['PDF','Excel'],
      icon:'graduation-cap',
      tone:'blue',
      lastGen:'Mon · 6:15 PM',
    },
    {
      id:'qas',
      code:'',
      title:'Quarterly Attendance Summary',
      desc:'Per-class totals: school days, absences, tardiness, excused.',
      formats:['PDF','Excel'],
      icon:'calendar-check',
      tone:'purple',
      lastGen:'Sun · 11:00 AM',
    },
    {
      id:'risk',
      code:'',
      title:'At-Risk Students Report',
      desc:'Auto-filtered: attendance below 80% or grade below 75. Includes recommended interventions.',
      formats:['PDF'],
      icon:'alert-triangle',
      tone:'amber',
      lastGen:'Yesterday',
    },
    {
      id:'honor',
      code:'',
      title:'Honor Roll List',
      desc:'Auto-generated honor tiers: With Highest / High / With Honors.',
      formats:['PDF','Print'],
      icon:'award',
      tone:'rose',
      lastGen:'Q2 finalized',
    },
    {
      id:'sf10',
      code:'SF10',
      title:"Learner's Permanent Record",
      desc:"Cumulative academic history per learner. Use end of year only.",
      formats:['PDF'],
      icon:'archive',
      tone:'muted',
      lastGen:'—',
      note:'Locked outside Q4 transmittal window.',
      locked: true,
    },
    {
      id:'cust',
      code:'',
      title:'Custom export',
      desc:'Pick fields and filters to roll your own Excel export.',
      formats:['Excel'],
      icon:'sliders-horizontal',
      tone:'primary',
      lastGen:'—',
    },
  ];

  const tone = {
    primary: { bg:'#CCFBF1', fg:'#0F766E' },
    accent:  { bg:'#D1FAE5', fg:'#047857' },
    blue:    { bg:'#DBEAFE', fg:'#1D4ED8' },
    amber:   { bg:'#FEF3C7', fg:'#92400E' },
    rose:    { bg:'#FFE4E6', fg:'#9F1239' },
    purple:  { bg:'#EDE9FE', fg:'#6D28D9' },
    muted:   { bg:'#F1F5F9', fg:'#475569' },
  };

  return (
    <div className="page-anim space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-navy">Reports & exports</h2>
            <p className="text-[13px] text-muted mt-1">Generate official DepEd forms or quick exports. Files build locally and queue to email when online.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select className="!h-9 max-w-[220px]" defaultValue="all">
              <option value="all">All classes</option>
              {CLASSES.map(c => <option key={c.id}>{c.grade} · {c.section} · {c.subject}</option>)}
            </Select>
            <Select className="!h-9 max-w-[140px]" defaultValue={TEACHER.quarter}>
              <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => {
          const t = tone[r.tone] || tone.muted;
          return (
            <Card key={r.id} className="p-4 sm:p-5 relative overflow-hidden">
              {r.locked && <span className="absolute top-3 right-3 pill" style={{background:'#F1F5F9', color:'#475569'}}><Icon name="lock" size={11}/>Locked</span>}
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-md inline-flex items-center justify-center shrink-0" style={{background:t.bg, color:t.fg}}>
                  <Icon name={r.icon} size={20}/>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-navy">{r.title}</h3>
                    {r.code && <Badge status="primary">{r.code}</Badge>}
                  </div>
                  <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{r.desc}</p>
                  {r.note && <p className="text-[11.5px] text-amber-700 mt-2 inline-flex items-center gap-1"><Icon name="info" size={11}/>{r.note}</p>}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {r.formats.map(f => (
                      <span key={f} className="pill" style={{background:'#F1F5F9', color:'#334155'}}>
                        <Icon name={f==='PDF'?'file-text':f==='Excel'?'file-spreadsheet':'printer'} size={10}/>{f}
                      </span>
                    ))}
                    <span className="ml-auto text-[11px] text-muted">Last · {r.lastGen}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Btn variant="secondary" size="sm" icon="eye" onClick={() => setPreviewing(r)}>Preview</Btn>
                    <Btn variant={r.locked?'ghost':'primary'} size="sm" icon="download" disabled={r.locked}
                      onClick={() => toast.push({ type:'success', title:'Report queued', message:`${r.title} will download when ready.` })}>
                      {r.locked ? 'Unavailable' : 'Generate'}
                    </Btn>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Preview modal */}
      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        title={previewing ? `Preview · ${previewing.title}` : ''}
        subtitle={previewing ? `${previewing.code || 'Internal'} · ${TEACHER.schoolYear} · ${TEACHER.quarter}` : ''}
        width="max-w-3xl"
        footer={<>
          <Btn variant="ghost" onClick={() => setPreviewing(null)}>Close</Btn>
          <Btn variant="secondary" icon="printer">Print</Btn>
          <Btn variant="primary" icon="download" onClick={() => { setPreviewing(null); toast.push({ type:'success', title:'Downloaded', message: previewing?.title }); }}>Download PDF</Btn>
        </>}>
        {previewing && previewing.id === 'sf2' && <ReportSF2/>}
        {previewing && previewing.id === 'sf9' && <ReportSF9/>}
        {previewing && previewing.id === 'gs'  && <ReportGradeSummary/>}
        {previewing && (previewing.id === 'qas' || previewing.id === 'risk' || previewing.id === 'honor') && <GenericReport report={previewing}/>}
        {previewing && (previewing.id === 'sf10' || previewing.id === 'cust') && <GenericReport report={previewing}/>}
      </Modal>
    </div>
  );
}

// SF2 mock preview
function ReportSF2() {
  const days = Array.from({length:22}, (_,i)=>i+1);
  return (
    <div className="bg-white text-[10px] text-navy">
      <div className="border-2 border-navy p-3">
        <div className="text-center">
          <div className="text-[9px] font-semibold tracking-widest text-muted">REPUBLIC OF THE PHILIPPINES · DEPARTMENT OF EDUCATION</div>
          <div className="text-[14px] font-bold mt-1">SF2 — DAILY ATTENDANCE REPORT OF LEARNERS</div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3 text-[10px]">
          <div><span className="text-muted">School ID</span><div className="font-mono font-semibold">301045</div></div>
          <div><span className="text-muted">School Year</span><div className="font-semibold">{TEACHER.schoolYear}</div></div>
          <div><span className="text-muted">Month</span><div className="font-semibold">January 2025</div></div>
          <div><span className="text-muted">Grade / Section</span><div className="font-semibold">Grade 7 – Rizal</div></div>
        </div>
      </div>
      <table className="w-full mt-3 text-[9.5px] border-collapse">
        <thead className="bg-slate-100 text-navy">
          <tr>
            <th className="border border-line px-1 py-1 text-left">#</th>
            <th className="border border-line px-1 py-1 text-left">LEARNER'S NAME (Last, First M.I.)</th>
            {days.map(d => <th key={d} className="border border-line px-1 py-1 w-5">{d}</th>)}
            <th className="border border-line px-1 py-1">A</th>
            <th className="border border-line px-1 py-1">T</th>
          </tr>
        </thead>
        <tbody>
          {STUDENTS_RIZAL.slice(0,12).map((s,i) => (
            <tr key={s.lrn}>
              <td className="border border-line px-1 py-0.5 font-mono">{i+1}</td>
              <td className="border border-line px-1 py-0.5">{s.last}, {s.first} {s.mi}.</td>
              {days.map(d => {
                const dow = (new Date(2025,0,d)).getDay();
                if (dow===0 || dow===6) return <td key={d} className="border border-line bg-slate-100"/>;
                if (d > 14) return <td key={d} className="border border-line"/>;
                // simple deterministic: most present
                const r = ((s.n*7) + d*3) % 20;
                const mk = r === 0 ? 'A' : r === 1 ? 'T' : r === 2 ? 'E' : '';
                return <td key={d} className={`border border-line text-center font-bold ${mk==='A'?'text-rose-600':mk==='T'?'text-amber-600':mk==='E'?'text-violet-600':''}`}>{mk}</td>;
              })}
              <td className="border border-line text-center font-bold">{(s.n*7) % 5 < 2 ? '1' : '0'}</td>
              <td className="border border-line text-center">{(s.n*5) % 6 < 2 ? '1' : '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-4 text-[9.5px] text-muted">
        <span><span className="font-bold text-navy">A</span> = Absent</span>
        <span><span className="font-bold text-navy">T</span> = Tardy</span>
        <span><span className="font-bold text-navy">E</span> = Excused</span>
        <span className="ml-auto">Prepared by: <span className="font-semibold text-navy">{TEACHER.name}</span> · {TEACHER.position}</span>
      </div>
    </div>
  );
}

function ReportSF9() {
  return (
    <div className="bg-white text-navy">
      <div className="border-2 border-navy p-4 text-center">
        <div className="text-[10px] font-semibold tracking-widest text-muted">REPUBLIC OF THE PHILIPPINES · DEPARTMENT OF EDUCATION</div>
        <div className="text-[16px] font-bold mt-1">SF9 — LEARNER'S PROGRESS REPORT CARD</div>
        <div className="text-[11px] text-muted mt-1">{TEACHER.school} · {TEACHER.schoolYear}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-[12px]">
        <div><span className="text-muted">Name</span><div className="font-semibold">dela Cruz, Juan R.</div></div>
        <div><span className="text-muted">LRN</span><div className="font-mono">105432100001</div></div>
        <div><span className="text-muted">Grade / Section</span><div className="font-semibold">Grade 7 – Rizal</div></div>
      </div>
      <table className="w-full mt-4 text-[11.5px] border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-line px-2 py-1.5 text-left">Learning Areas</th>
            <th className="border border-line px-2 py-1.5">Q1</th>
            <th className="border border-line px-2 py-1.5">Q2</th>
            <th className="border border-line px-2 py-1.5">Q3</th>
            <th className="border border-line px-2 py-1.5">Q4</th>
            <th className="border border-line px-2 py-1.5">Final</th>
            <th className="border border-line px-2 py-1.5">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Filipino', 86, 88, 89, '–', '88', 'Passed'],
            ['English', 90, 91, 92, '–', '91', 'Passed'],
            ['Mathematics', 84, 85, 83, '–', '84', 'Passed'],
            ['Science', 86, 87, 88, '–', '87', 'Passed'],
            ['Araling Panlipunan', 88, 90, 89, '–', '89', 'Passed'],
            ['EsP', 91, 92, 93, '–', '92', 'Passed'],
            ['MAPEH', 89, 90, 90, '–', '90', 'Passed'],
            ['TLE', 85, 87, 86, '–', '86', 'Passed'],
          ].map((r,i) => (
            <tr key={i}>
              <td className="border border-line px-2 py-1.5 font-semibold">{r[0]}</td>
              {r.slice(1).map((x,j) => <td key={j} className={`border border-line px-2 py-1.5 text-center ${j<4?'font-mono':''}`}>{x}</td>)}
            </tr>
          ))}
          <tr className="bg-primary-light/40">
            <td className="border border-line px-2 py-1.5 font-bold">General Average</td>
            <td className="border border-line text-center font-mono font-bold">87.4</td>
            <td className="border border-line text-center font-mono font-bold">88.8</td>
            <td className="border border-line text-center font-mono font-bold">88.8</td>
            <td className="border border-line text-center">–</td>
            <td className="border border-line text-center font-mono font-bold text-primary-dark">88.3</td>
            <td className="border border-line text-center font-semibold">With Honors</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 text-[11px] text-muted">Adviser: <span className="text-navy font-semibold">{TEACHER.name}</span> · Principal: <span className="text-navy font-semibold">Ricardo G. Lim, EdD</span></div>
    </div>
  );
}

function ReportGradeSummary() {
  const list = STUDENTS_RIZAL.slice(0,12);
  return (
    <div>
      <div className="text-[10px] text-muted">{TEACHER.school} · Grade 7 – Rizal · Science · {TEACHER.quarter}</div>
      <div className="text-[15px] font-bold text-navy">Class Grade Summary</div>
      <table className="w-full mt-3 text-[11.5px] border-collapse">
        <thead className="bg-slate-100 text-navy">
          <tr>
            <th className="border border-line px-2 py-1.5 text-left">#</th>
            <th className="border border-line px-2 py-1.5 text-left">Name</th>
            <th className="border border-line px-2 py-1.5">WW (20%)</th>
            <th className="border border-line px-2 py-1.5">PT (60%)</th>
            <th className="border border-line px-2 py-1.5">QA (20%)</th>
            <th className="border border-line px-2 py-1.5">Initial</th>
            <th className="border border-line px-2 py-1.5">Trans.</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s,i) => {
            const init = Math.round(s.grade * 0.95 + 4);
            const trans = s.grade;
            return (
              <tr key={s.lrn}>
                <td className="border border-line px-2 py-1.5 font-mono">{i+1}</td>
                <td className="border border-line px-2 py-1.5">{s.last}, {s.first}</td>
                <td className="border border-line px-2 py-1.5 text-center font-mono">{Math.round(s.grade-2)}</td>
                <td className="border border-line px-2 py-1.5 text-center font-mono">{Math.round(s.grade+4)}</td>
                <td className="border border-line px-2 py-1.5 text-center font-mono">{Math.round(s.grade-3)}</td>
                <td className="border border-line px-2 py-1.5 text-center font-mono">{init}</td>
                <td className="border border-line px-2 py-1.5 text-center font-mono font-bold" style={{ color: trans>=75? '#065F46':'#7F1D1D'}}>{trans}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GenericReport({ report }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md bg-surface border border-line p-4">
        <div className="text-[12px] text-muted">Generating preview for</div>
        <div className="text-[15px] font-semibold text-navy">{report.title}</div>
        <div className="text-[12px] text-muted mt-1">{report.desc}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-line p-3 text-center"><div className="text-[10px] uppercase text-muted">Rows</div><div className="text-[20px] font-bold text-navy font-mono">155</div></div>
        <div className="rounded-md border border-line p-3 text-center"><div className="text-[10px] uppercase text-muted">Pages</div><div className="text-[20px] font-bold text-navy font-mono">6</div></div>
        <div className="rounded-md border border-line p-3 text-center"><div className="text-[10px] uppercase text-muted">Size</div><div className="text-[20px] font-bold text-navy font-mono">412 KB</div></div>
      </div>
      <div className="rounded-md bg-primary-light/40 border border-primary-light p-3 text-[12.5px] text-primary-dark flex items-center gap-2">
        <Icon name="info" size={14}/> The full preview renders after generation. Click <span className="font-semibold">Download PDF</span> to build the file.
      </div>
    </div>
  );
}

