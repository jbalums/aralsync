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

// ─── STUDENTS (list + profile) ───────────────────────────

export function PageStudents({ setRoute, setSelectedStudent }) {
  const [q, setQ] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [actionFor, setActionFor] = useState(null);
  const toast = useToast();

  // Compose a list across classes — use Rizal roster + 3 lighter rosters for variety
  const buildAll = () => {
    const all = [];
    CLASSES.forEach(c => {
      const list = STUDENTS_RIZAL.slice(0, c.count).map((s, i) => ({
        ...s,
        section: `${c.grade} – ${c.section}`,
        classId: c.id,
        subject: c.subject,
        // Add slight per-class variance so totals don't look identical
        att: Math.max(60, Math.min(100, s.att - (c.id==='g7r-sci'?0: ((i*3 + c.id.length)%10) - 3))),
        grade: Math.max(60, Math.min(100, s.grade + (c.id==='g7r-sci'?0: ((i*5 + c.id.length)%8) - 3))),
      }));
      all.push(...list);
    });
    return all;
  };
  const all = useMemo(buildAll, []);

  const filtered = all.filter(s => {
    if (q && !`${s.last} ${s.first}`.toLowerCase().includes(q.toLowerCase()) && !s.lrn.includes(q)) return false;
    if (classFilter !== 'all' && s.classId !== classFilter) return false;
    if (riskFilter === 'at-risk' && !(s.att < 85 || (s.grade >= 75 && s.grade <= 79))) return false;
    if (riskFilter === 'failing' && !(s.att < 75 || s.grade < 75)) return false;
    if (riskFilter === 'on-track' && !(s.att >= 85 && s.grade >= 80)) return false;
    return true;
  });

  const stats = {
    total: all.length,
    onTrack: all.filter(s => studentStatus(s.att, s.grade) === 'ontrack').length,
    atRisk:  all.filter(s => studentStatus(s.att, s.grade) === 'atrisk').length,
    needs:   all.filter(s => studentStatus(s.att, s.grade) === 'needshelp').length,
  };

  return (
    <div className="page-anim space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="users" label="Total students" value={stats.total} color="primary" sub="Across 4 classes"/>
        <StatCard icon="check-circle" label="On track" value={stats.onTrack} color="accent" sub="Att ≥85 · Grade ≥80"/>
        <StatCard icon="alert-triangle" label="At risk" value={stats.atRisk} color="amber" sub="Watch closely"/>
        <StatCard icon="life-buoy" label="Needs help" value={stats.needs} color="rose" sub="Below passing"/>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or LRN…" className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"/>
          </div>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="!h-9 max-w-[220px]">
            <option value="all">All classes</option>
            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.grade} · {c.section} · {c.subject}</option>)}
          </Select>
          <div className="inline-flex rounded-md border border-line bg-white overflow-hidden">
            {[
              { id:'all',     label:'All' },
              { id:'on-track',label:'On Track' },
              { id:'at-risk', label:'At Risk' },
              { id:'failing', label:'Needs Help' },
            ].map(o => (
              <button key={o.id} onClick={() => setRiskFilter(o.id)} className={`px-3 h-9 text-[12px] font-semibold tx ${riskFilter===o.id?'bg-navy text-white':'text-navy hover:bg-surface'}`}>{o.label}</button>
            ))}
          </div>
          <span className="ml-auto"></span>
          <Btn variant="secondary" size="sm" icon="upload" onClick={() => setImportOpen(true)}>Import CSV</Btn>
          <Btn variant="primary" size="sm" icon="user-plus" onClick={() => setAddOpen(true)}>Add student</Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface text-muted text-left">
              <tr>
                <th className="px-3 py-2.5 font-semibold w-10">#</th>
                <th className="px-3 py-2.5 font-semibold">Student</th>
                <th className="px-3 py-2.5 font-semibold">LRN</th>
                <th className="px-3 py-2.5 font-semibold">Section</th>
                <th className="px-3 py-2.5 font-semibold">Attendance</th>
                <th className="px-3 py-2.5 font-semibold">Q3 Grade</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((s,i) => (
                <tr key={`${s.classId}-${s.lrn}`} className="border-t border-line hover:bg-slate-50/40 cursor-pointer" onClick={() => { setSelectedStudent(s); setRoute('student-profile'); }}>
                  <td className="px-3 py-2 font-mono text-muted">{i+1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${s.first} ${s.last}`} size="sm"/>
                      <div>
                        <div className="font-semibold text-navy">{s.last}, {s.first} {s.mi}.</div>
                        <div className="text-[10.5px] text-muted">{s.subject}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-muted">{s.lrn}</td>
                  <td className="px-3 py-2 text-navy">{s.section}</td>
                  <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-16"><Progress value={s.att} barClass={s.att>=85?'bg-emerald-500':s.att>=75?'bg-amber-500':'bg-rose-500'}/></div><span className="font-mono text-navy font-semibold">{s.att}%</span></div></td>
                  <td className="px-3 py-2"><span className="inline-flex items-center justify-center w-10 h-7 rounded-md font-mono text-[12px] font-bold" style={gradeColor(s.grade)}>{s.grade}</span></td>
                  <td className="px-3 py-2"><Badge status={studentStatus(s.att, s.grade)}/></td>
                  <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      trigger={<button className="p-1.5 rounded hover:bg-slate-100"><Icon name="more-horizontal" size={16} className="text-muted"/></button>}
                      items={[
                        { label:'View profile', icon:'eye', onClick: () => { setSelectedStudent(s); setRoute('student-profile'); } },
                        { label:'Add note', icon:'message-square-plus', onClick: () => toast.push({ message:'Opened note composer' }) },
                        { label:'Contact guardian', icon:'phone', onClick: () => toast.push({ message:'Guardian contact opened' }) },
                        { separator:true },
                        { label:'Remove from class', icon:'user-minus' },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-line flex items-center justify-between text-[12px] text-muted">
          <span>Showing {Math.min(filtered.length, 60)} of {filtered.length} · Page 1</span>
          <div className="flex items-center gap-1">
            <Btn size="sm" variant="ghost" icon="chevron-left">Prev</Btn>
            <Btn size="sm" variant="ghost" iconRight="chevron-right">Next</Btn>
          </div>
        </div>
      </Card>

      {/* Import CSV modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import students from CSV"
        subtitle="Drag-drop your DepEd roster CSV, or download our template"
        width="max-w-2xl"
        footer={<>
          <Btn variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Btn>
          <Btn variant="primary" icon="upload" onClick={() => { setImportOpen(false); toast.push({ type:'success', title:'Import queued', message:'Will process 38 rows on next sync.' }); }}>Import 38 rows</Btn>
        </>}>
        <div className="rounded-md border-2 border-dashed border-line bg-surface/50 p-8 text-center">
          <Icon name="upload-cloud" size={36} className="text-primary mx-auto"/>
          <div className="text-[14px] font-semibold text-navy mt-3">Drop a CSV file here</div>
          <div className="text-[12px] text-muted mt-1">or <button className="text-primary font-semibold">browse files</button> · max 5 MB · UTF-8</div>
        </div>
        <div className="mt-4 flex items-center justify-between bg-primary-light/30 border border-primary-light rounded-md p-3">
          <div className="flex items-center gap-2 text-[12.5px] text-primary-dark">
            <Icon name="file-spreadsheet" size={16}/>
            <span><span className="font-semibold">deped_roster_template.csv</span> · 14 columns · UTF-8</span>
          </div>
          <Btn variant="ghost" size="sm" icon="download">Download template</Btn>
        </div>
        <div className="mt-4">
          <div className="text-[12px] font-semibold text-navy mb-2">Field mapping preview</div>
          <div className="overflow-hidden rounded-md border border-line">
            <table className="w-full text-[12px]">
              <thead className="bg-surface text-muted">
                <tr><th className="px-3 py-2 text-left font-semibold">CSV column</th><th className="px-3 py-2 text-left font-semibold">Maps to</th><th className="px-3 py-2 text-left font-semibold">Sample</th></tr>
              </thead>
              <tbody>
                {[
                  ['LRN','Student.lrn','105432100023'],
                  ['LAST_NAME','Student.last','Bautista'],
                  ['FIRST_NAME','Student.first','Sofia'],
                  ['MI','Student.mi','B'],
                  ['GENDER','Student.gender','F'],
                  ['BIRTHDAY','Student.dob','2012-03-19'],
                  ['GUARDIAN','Student.guardian','Rosario Bautista'],
                ].map((r,i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-3 py-1.5 font-mono text-navy">{r[0]}</td>
                    <td className="px-3 py-1.5 text-muted">{r[1]}</td>
                    <td className="px-3 py-1.5 text-navy">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Add student modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add student" subtitle="Adds a learner to the selected class"
        width="max-w-2xl"
        footer={<>
          <Btn variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn variant="primary" icon="user-plus" onClick={() => { setAddOpen(false); toast.push({ type:'success', message:'Student added · queued for sync.' }); }}>Add learner</Btn>
        </>}>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Last name" required><TextInput placeholder="dela Cruz"/></Field>
          <Field label="First name" required><TextInput placeholder="Juan"/></Field>
          <Field label="Middle initial"><TextInput placeholder="R" maxLength={2}/></Field>
          <Field label="LRN (12 digits)" required><TextInput placeholder="105432100123" maxLength={12}/></Field>
          <Field label="Gender"><Select><option>Female</option><option>Male</option></Select></Field>
          <Field label="Birthday"><TextInput type="date"/></Field>
          <Field label="Section" required>
            <Select>
              {CLASSES.map(c => <option key={c.id}>{c.grade} · {c.section} · {c.subject}</option>)}
            </Select>
          </Field>
          <Field label="Guardian name"><TextInput placeholder="Rosario dela Cruz"/></Field>
          <Field label="Guardian contact"><TextInput placeholder="+63 917 123 4567"/></Field>
        </div>
      </Modal>
    </div>
  );
}

// ─── STUDENT PROFILE ─────────────────────────────────────

export function PageStudentProfile({ student, setRoute }) {
  // Default to Juan dela Cruz when no specific student passed
  const s = student || { ...STUDENTS_RIZAL[0], section:'Grade 7 – Rizal', classId:'g7r-sci', subject:'Science' };
  const [tab, setTab] = useState('overview');
  const fullName = `${s.first} ${s.mi ? s.mi+'.' : ''} ${s.last}`.replace(/\s+/g,' ').trim();
  const status = studentStatus(s.att, s.grade);

  // calendar statuses (Jan 2025)
  const calStat = useMemo(() => {
    const out = {};
    for (let d = 1; d <= 31; d++) {
      const dow = (new Date(2025,0,d)).getDay();
      if (dow === 0 || dow === 6) { out[d] = 'weekend'; continue; }
      if (d > 14) { out[d] = 'future'; continue; }
      if (d === 6) out[d] = 'late';
      else if (d === 10) out[d] = 'absent';
      else if (d === 8) out[d] = 'excused';
      else out[d] = 'present';
    }
    return out;
  }, [s.lrn]);

  return (
    <div className="page-anim space-y-5">
      {/* Header */}
      <Card className="p-5 sm:p-6">
        <button onClick={() => setRoute('students')} className="text-[12px] text-muted hover:text-navy inline-flex items-center gap-1 mb-3"><Icon name="arrow-left" size={12}/> Back to Students</button>
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar name={fullName} size="xl"/>
          <div className="flex-1 min-w-0">
            <h2 className="text-[24px] font-semibold tracking-tight text-navy">{s.last}, {s.first} {s.mi}.</h2>
            <div className="text-[13px] text-muted mt-0.5">LRN <span className="font-mono">{s.lrn}</span> · {s.section || 'Grade 7 – Rizal'} · {s.subject || 'Science'}</div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge status={status} size="lg"/>
              <span className="pill" style={{background:'#F1F5F9', color:'#334155'}}><Icon name="cake" size={11}/>Age 13</span>
              <span className="pill" style={{background:'#F1F5F9', color:'#334155'}}><Icon name="user-2" size={11}/>{s.first[0]==='J'?'Male':'Female'}</span>
              <span className="pill" style={{background:'#F1F5F9', color:'#334155'}}><Icon name="calendar" size={11}/>Enrolled Jun 2024</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="message-square-plus">Add note</Btn>
            <Btn variant="primary" size="sm" icon="phone">Contact guardian</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id:'overview',   label:'Overview', icon:'layout-dashboard' },
          { id:'attendance', label:'Attendance', icon:'clipboard-check' },
          { id:'grades',     label:'Grades',  icon:'graduation-cap' },
          { id:'notes',      label:'Notes',   icon:'message-square', count: STUDENT_NOTES.length },
        ]}
        active={tab} onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="check-circle" label="Attendance" value={`${s.att}%`} color="accent" sub="Q3 to date" trend="+0.4%"/>
            <StatCard icon="graduation-cap" label="Q3 Average" value={s.grade} color="primary" sub="Initial · pre-QA" trend="+1.2%"/>
            <StatCard icon="user-x" label="Days absent" value="2" color="rose" sub="of 9 school days"/>
            <StatCard icon="medal" label="Class rank" value="7th" color="blue" sub="of 42 students"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2">
              <SectionHeader title="Performance vs class average" subtitle={`${TEACHER.quarter} · ${s.subject || 'Science'}`}/>
              <div className="space-y-3">
                {[
                  { label:'Written Works', mine: 86, avg: 82 },
                  { label:'Performance Tasks', mine: 93, avg: 88 },
                  { label:'Quarterly Assessment', mine: 76, avg: 81 },
                  { label:'Attendance %', mine: s.att, avg: 92 },
                ].map((r,i) => {
                  const mineW = Math.max(8, r.mine);
                  const avgW = Math.max(8, r.avg);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span className="font-semibold text-navy">{r.label}</span>
                        <span className="font-mono text-muted">You <span className="text-navy font-semibold">{r.mine}</span> · Class <span className="text-navy font-semibold">{r.avg}</span></span>
                      </div>
                      <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-slate-300/80" style={{ width: `${avgW}%` }}/>
                        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${mineW}%`, mixBlendMode:'multiply' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Guardian"/>
              <div className="flex items-center gap-3">
                <Avatar name="Rosario dela Cruz" size="lg"/>
                <div>
                  <div className="text-[14px] font-semibold text-navy">Rosario dela Cruz</div>
                  <div className="text-[12px] text-muted">Mother · Primary contact</div>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-[12.5px]">
                <div className="flex items-center gap-2 text-navy"><Icon name="phone" size={14} className="text-muted"/>+63 917 458 2210</div>
                <div className="flex items-center gap-2 text-navy"><Icon name="mail" size={14} className="text-muted"/>r.delacruz@gmail.com</div>
                <div className="flex items-center gap-2 text-navy"><Icon name="home" size={14} className="text-muted"/>26 P. Burgos St., Bacolod City</div>
              </div>
              <Btn variant="secondary" size="sm" className="w-full mt-4" icon="message-circle">Send a quick SMS</Btn>
            </Card>
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-navy">January 2025</h3>
                <p className="text-[12px] text-muted">Daily status across all subjects</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted">
                {['present','late','absent','excused'].map(k => {
                  const sB = BADGE_STYLES[k];
                  return <span key={k} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:sB.dot}}/>{sB.label}</span>;
                })}
              </div>
            </div>
            <div className="max-w-md"><HeatCalendar year={2025} month={0} statuses={calStat}/></div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-line"><h3 className="text-[14px] font-semibold text-navy">Monthly breakdown</h3></div>
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left"><tr><th className="px-3 py-2 font-semibold">Month</th><th className="px-3 py-2 font-semibold">Present</th><th className="px-3 py-2 font-semibold">Late</th><th className="px-3 py-2 font-semibold">Absent</th><th className="px-3 py-2 font-semibold">Excused</th><th className="px-3 py-2 font-semibold text-right">%</th></tr></thead>
              <tbody>
                {[
                  ['Jan 2025', 9, 1, 1, 1, 95.0],
                  ['Dec 2024', 14, 2, 0, 0, 96.5],
                  ['Nov 2024', 19, 1, 1, 1, 95.5],
                  ['Oct 2024', 18, 0, 2, 1, 92.8],
                  ['Sep 2024', 20, 2, 0, 0, 100.0],
                ].map((r,i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-3 py-2 font-mono text-navy">{r[0]}</td>
                    <td className="px-3 py-2"><Badge status="present">{r[1]}</Badge></td>
                    <td className="px-3 py-2"><Badge status="late">{r[2]}</Badge></td>
                    <td className="px-3 py-2"><Badge status="absent">{r[3]}</Badge></td>
                    <td className="px-3 py-2"><Badge status="excused">{r[4]}</Badge></td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-navy">{r[5].toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'grades' && (
        <div className="space-y-3">
          {CLASSES.map((c, idx) => {
            // Mostly Science is detailed; rest summarized
            const isMain = idx === 0;
            const ww = isMain ? JUAN_SCORES.ww : [[7,10],[8,10],[9,10]];
            const pt = isMain ? JUAN_SCORES.pt : [[40,50],[45,50]];
            const qa = isMain ? JUAN_SCORES.qa : [38,50];
            const wwAvg = ww.reduce((a,[x,y])=>a+(x/y)*100,0)/ww.length;
            const ptAvg = pt.reduce((a,[x,y])=>a+(x/y)*100,0)/pt.length;
            const qaPct = (qa[0]/qa[1])*100;
            const q = Math.round((wwAvg*c.weights.ww + ptAvg*c.weights.pt + qaPct*c.weights.qa)/100);
            return (
              <Card key={c.id} className="overflow-hidden">
                <details className="group" open={isMain}>
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-3 hover:bg-slate-50 tx">
                    <SubjectChip subject={c.subject}/>
                    <span className="text-[13px] font-semibold text-navy">{c.grade} – {c.section}</span>
                    <span className="ml-auto inline-flex items-center gap-3">
                      <span className="text-[11px] text-muted">Quarter grade</span>
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-md font-mono text-[14px] font-bold" style={gradeColor(q)}>{q}</span>
                      <Icon name="chevron-down" size={14} className="text-muted group-open:rotate-180 tx"/>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-line pt-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Written Works ({c.weights.ww}%)</div>
                      <div className="space-y-1.5">
                        {ww.map((r,i) => <ScoreRow key={i} label={`WW${i+1}`} a={r[0]} b={r[1]}/>)}
                      </div>
                      <div className="mt-2 pt-2 border-t border-dashed border-line flex items-center justify-between text-[12px]"><span className="text-muted">Average</span><span className="font-mono font-semibold text-navy">{wwAvg.toFixed(1)}</span></div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Performance Tasks ({c.weights.pt}%)</div>
                      <div className="space-y-1.5">
                        {pt.map((r,i) => <ScoreRow key={i} label={`PT${i+1}`} a={r[0]} b={r[1]}/>)}
                      </div>
                      <div className="mt-2 pt-2 border-t border-dashed border-line flex items-center justify-between text-[12px]"><span className="text-muted">Average</span><span className="font-mono font-semibold text-navy">{ptAvg.toFixed(1)}</span></div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Quarterly Assessment ({c.weights.qa}%)</div>
                      <ScoreRow label="Raw" a={qa[0]} b={qa[1]}/>
                      <div className="mt-2 pt-2 border-t border-dashed border-line flex items-center justify-between text-[12px]"><span className="text-muted">Percentage</span><span className="font-mono font-semibold text-navy">{qaPct.toFixed(1)}</span></div>
                      <div className="mt-3 rounded-md bg-primary-light/40 p-2 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-primary-dark">Quarterly grade</div>
                        <div className="text-[24px] font-semibold text-primary-dark font-mono">{q}</div>
                      </div>
                    </div>
                  </div>
                </details>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <Card className="p-5">
            <SectionHeader title="Notes" subtitle="Chronological · most recent first"/>
            <div className="space-y-3">
              {STUDENT_NOTES.map(n => {
                const palette = {
                  Academic:'bg-blue-100 text-blue-800',
                  Behavioral:'bg-emerald-100 text-emerald-800',
                  Health:'bg-rose-100 text-rose-800',
                  General:'bg-slate-100 text-slate-700',
                }[n.cat] || 'bg-slate-100 text-slate-700';
                return (
                  <div key={n.id} className="border-l-2 border-primary/40 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${palette}`}>{n.cat}</span>
                      <span className="text-[11px] text-muted font-mono">{n.date}</span>
                    </div>
                    <p className="text-[13px] text-navy leading-relaxed">{n.text}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <SectionHeader title="Add a note"/>
            <Field label="Category">
              <Select><option>Academic</option><option>Behavioral</option><option>Health</option><option>General</option></Select>
            </Field>
            <div className="mt-3">
              <Field label="Note">
                <textarea rows={6} placeholder="Observation, intervention, parent conversation, etc." className="w-full px-3 py-2 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none resize-none"/>
              </Field>
            </div>
            <Btn variant="primary" className="w-full mt-3" icon="save">Save note</Btn>
          </Card>
        </div>
      )}
    </div>
  );
}

export function ScoreRow({ label, a, b }) {
  const pct = (a/b)*100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11.5px] font-mono w-9 text-muted">{label}</span>
      <span className="flex-1 text-[12.5px] text-navy font-semibold font-mono">{a}/{b}</span>
      <span className="text-[11px] text-muted font-mono">{pct.toFixed(0)}%</span>
    </div>
  );
}

