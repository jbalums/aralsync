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
import { PageGradebook } from './Gradebook.jsx';

// ─── MY CLASSES (list) + CLASS DETAIL ────────────────────

export function PageClasses({ setRoute, setSelectedClass }) {
  const [filter, setFilter] = useState('all');     // all|g7|g8|g9
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [newOpen, setNewOpen] = useState(false);
  const toast = useToast();

  const list = CLASSES.filter(c => {
    if (filter === 'g7' && !c.grade.includes('7')) return false;
    if (filter === 'g8' && !c.grade.includes('8')) return false;
    if (filter === 'g9' && !c.grade.includes('9')) return false;
    if (subjectFilter !== 'all' && c.subject !== subjectFilter) return false;
    return true;
  });

  return (
    <div className="page-anim space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-navy">Your class loads</h2>
            <p className="text-[13px] text-muted mt-1">{CLASSES.length} active classes · {CLASSES.reduce((a,c)=>a+c.count,0)} total students · School Year {TEACHER.schoolYear}</p>
          </div>
          <Btn variant="primary" icon="plus" onClick={() => setNewOpen(true)}>New class</Btn>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {[
            { id:'all', label:'All' },
            { id:'g7',  label:'Grade 7' },
            { id:'g8',  label:'Grade 8' },
            { id:'g9',  label:'Grade 9' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 h-8 rounded-md text-[12.5px] font-semibold tx press ${filter===f.id?'bg-navy text-white':'bg-white text-navy border border-line hover:bg-surface'}`}>{f.label}</button>
          ))}
          <span className="w-px h-5 bg-line mx-1"/>
          <Select value={subjectFilter} onChange={(e)=>setSubjectFilter(e.target.value)} className="!h-8 max-w-[200px]">
            <option value="all">All subjects</option>
            {Object.keys(SUBJECT_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <span className="ml-auto text-[12px] text-muted">{list.length} shown</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.map(c => {
          const sc = SUBJECT_COLORS[c.subject];
          return (
            <Card key={c.id} variant="interactive" className="overflow-hidden" onClick={() => { setSelectedClass(c.id); setRoute('class-detail'); }}>
              <div className="h-2 w-full" style={{ background: sc.hue }}/>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SubjectChip subject={c.subject}/>
                      <QuarterBadge quarter={TEACHER.quarter}/>
                    </div>
                    <h3 className="text-[18px] font-semibold text-navy mt-2 tracking-tight">{c.grade} – {c.section}</h3>
                    <div className="text-[12px] text-muted mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1"><Icon name="users" size={12}/>{c.count} students</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Icon name="map-pin" size={12}/>{c.room}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Icon name="clock" size={12}/>{c.time}</span>
                    </div>
                  </div>
                  <Avatar name={c.section + ' ' + c.subject} size="md" square/>
                </div>

                {/* Stats line */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Attendance</div>
                    <div className="text-[18px] font-semibold text-navy font-mono mt-0.5">{c.att}%</div>
                    <Progress value={c.att} className="mt-1.5" barClass="bg-primary"/>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Avg grade</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center justify-center w-10 h-7 rounded-md font-mono text-[13px] font-bold" style={ gradeColor(c.avgGrade) }>{c.avgGrade}</span>
                      <span className="text-[11px] text-muted">{TEACHER.quarter}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Weights</div>
                    <ComponentWeightBar ww={c.weights.ww} pt={c.weights.pt} qa={c.weights.qa} className="mt-1.5"/>
                    <div className="text-[10.5px] text-muted font-mono mt-1">{c.weights.ww}/{c.weights.pt}/{c.weights.qa}</div>
                  </div>
                </div>

                {/* Component completion row */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {[
                    { label:'WW', n:c.prog.ww },
                    { label:'PT', n:c.prog.pt },
                    { label:'QA', n:c.prog.qa },
                  ].map((row,i) => {
                    const done = row.n[0] === row.n[1];
                    return (
                      <span key={i} className={`pill ${done?'':'opacity-90'}`} style={{ background: done? '#D1FAE5':'#F1F5F9', color: done?'#065F46':'#475569' }}>
                        <Icon name={done?'check':'minus'} size={10}/> {row.label} <span className="font-mono">{row.n[0]}/{row.n[1]}</span>
                      </span>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Btn variant="secondary" size="sm" icon="layout-dashboard" onClick={(e) => { e.stopPropagation(); setSelectedClass(c.id); setRoute('class-detail'); }}>View details</Btn>
                  <Btn variant="primary" size="sm" icon="clipboard-check" onClick={(e) => { e.stopPropagation(); setSelectedClass(c.id); setRoute('attendance'); }}>Take attendance</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* New class modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Create a new class load"
        subtitle="Fill in to add a new section to your assignments"
        width="max-w-2xl"
        footer={<>
          <Btn variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Btn>
          <Btn variant="primary" icon="plus" onClick={() => { setNewOpen(false); toast.push({ type:'success', title:'Class created', message:'You can now take attendance and enter grades.' }); }}>Create class</Btn>
        </>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Subject" required>
            <Select defaultValue="Science">
              {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              <option>Araling Panlipunan</option>
              <option>MAPEH</option>
              <option>Edukasyon sa Pagpapakatao</option>
              <option>TLE</option>
            </Select>
          </Field>
          <Field label="Grade level" required>
            <Select defaultValue="Grade 7"><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option></Select>
          </Field>
          <Field label="Section name" required><TextInput placeholder="e.g. Mabini"/></Field>
          <Field label="Room"><TextInput placeholder="e.g. Room 207"/></Field>
          <Field label="School Year"><TextInput defaultValue="2024–2025"/></Field>
          <Field label="Quarter"><Select defaultValue="Q3"><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></Select></Field>
        </div>
        <div className="mt-5">
          <div className="text-[12px] font-semibold text-navy mb-2">Component weights <span className="text-muted font-normal">(must total 100%)</span></div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Written Works (WW)"><TextInput type="number" defaultValue="20" /></Field>
            <Field label="Performance Tasks (PT)"><TextInput type="number" defaultValue="60" /></Field>
            <Field label="Quarterly Assessment (QA)"><TextInput type="number" defaultValue="20" /></Field>
          </div>
          <ComponentWeightBar ww={20} pt={60} qa={20} height={10} className="mt-3"/>
          <div className="text-[11px] text-muted mt-1 font-mono">Sum: 100% ✓</div>
        </div>
      </Modal>
    </div>
  );
}

// ─── CLASS DETAIL (tabs) ─────────────────────────────────

export function PageClassDetail({ classId, setRoute }) {
  const cls = useMemo(() => CLASSES.find(c => c.id === classId) || CLASSES[0], [classId]);
  const [tab, setTab] = useState('overview');
  const roster = STUDENTS_RIZAL.slice(0, cls.count);
  const sc = SUBJECT_COLORS[cls.subject];

  return (
    <div className="page-anim space-y-5">
      {/* Header card */}
      <Card className="p-4 sm:p-5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full" style={{ background: sc.hue }}/>
        <div className="pl-3 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <button onClick={() => setRoute('classes')} className="text-[12px] text-muted hover:text-navy inline-flex items-center gap-1 mb-2"><Icon name="arrow-left" size={12}/> Back to My Classes</button>
            <div className="flex items-center gap-2 flex-wrap">
              <SubjectChip subject={cls.subject}/>
              <QuarterBadge quarter={TEACHER.quarter}/>
              <span className="pill" style={{background:'#F1F5F9', color:'#334155'}}><Icon name="map-pin" size={11}/>{cls.room}</span>
              <span className="pill" style={{background:'#F1F5F9', color:'#334155'}}><Icon name="clock" size={11}/>{cls.time}</span>
            </div>
            <h2 className="text-[22px] font-semibold tracking-tight text-navy mt-2.5">{cls.grade} – {cls.section}</h2>
            <div className="text-[12.5px] text-muted mt-0.5">{cls.subject} · {cls.count} students · {TEACHER.schoolYear}</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="settings">Class settings</Btn>
            <Btn variant="primary" size="sm" icon="clipboard-check" onClick={() => setRoute('attendance')}>Take attendance</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id:'overview',   label:'Overview',   icon:'layout-dashboard' },
          { id:'students',   label:'Students',   icon:'users',         count: cls.count },
          { id:'attendance', label:'Attendance', icon:'clipboard-check' },
          { id:'gradebook',  label:'Gradebook',  icon:'graduation-cap' },
          { id:'reports',    label:'Reports',    icon:'file-text' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="users" label="Total Students" value={cls.count} color="primary" sub={`${cls.grade} · ${cls.section}`}/>
            <StatCard icon="check-circle" label="Avg attendance" value={`${cls.att}%`} trend="+0.6%" color="accent" sub="Q3 to date"/>
            <StatCard icon="graduation-cap" label="Avg grade" value={cls.avgGrade} trend="+1.2%" color="blue" sub={`${TEACHER.quarter} cumulative`}/>
            <StatCard icon="cloud-off" label="Pending sync" value={1} color="amber" sub="WW3 entries"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2">
              <SectionHeader title="Recent attendance" subtitle="Last 3 sessions"/>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="text-muted text-left">
                    <tr><th className="font-semibold pb-2">Date</th><th className="font-semibold pb-2">Present</th><th className="font-semibold pb-2">Late</th><th className="font-semibold pb-2">Absent</th><th className="font-semibold pb-2">Excused</th><th className="font-semibold pb-2 text-right">%</th></tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_LOG.slice(0,5).map((r,i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="py-2 font-mono text-navy">{r.date}</td>
                        <td className="py-2"><Badge status="present">{r.present}</Badge></td>
                        <td className="py-2"><Badge status="late">{r.late}</Badge></td>
                        <td className="py-2"><Badge status="absent">{r.absent}</Badge></td>
                        <td className="py-2"><Badge status="excused">{r.excused}</Badge></td>
                        <td className="py-2 text-right font-mono font-semibold text-navy">{r.pct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="p-5">
              <SectionHeader title="Upcoming sessions"/>
              <div className="space-y-3">
                {[
                  { d:'Tomorrow', t:cls.time, label:'Regular session' },
                  { d:'Thu Jan 16', t:cls.time, label:'Group experiment' },
                  { d:'Fri Jan 17', t:cls.time, label:'WW5 quiz · Newton\'s Laws' },
                ].map((row,i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-line/60 last:border-0">
                    <div className="w-12 h-12 rounded-md bg-primary-light text-primary-dark flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wide">{row.d.split(' ')[0]}</span>
                      <span className="text-[14px] font-semibold leading-none">{row.d.split(' ')[1] || ''}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-navy">{row.label}</div>
                      <div className="text-[11px] text-muted">{row.t} · {cls.room}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <SectionHeader title="Grade component progress" subtitle={`${TEACHER.quarter} entries vs. required`}/>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:'Written Works (WW)', n:cls.prog.ww, color:'bg-teal-500', icon:'pencil-line' },
                { label:'Performance Tasks (PT)', n:cls.prog.pt, color:'bg-emerald-500', icon:'wrench' },
                { label:'Quarterly Assessment (QA)', n:cls.prog.qa, color:'bg-indigo-500', icon:'file-check' },
              ].map((row,i) => {
                const pct = (row.n[0]/row.n[1])*100;
                return (
                  <div key={i} className="rounded-md border border-line p-3.5">
                    <div className="flex items-center gap-2"><Icon name={row.icon} size={14} className="text-muted"/><span className="text-[12.5px] font-semibold text-navy">{row.label}</span></div>
                    <div className="mt-2 flex items-end justify-between">
                      <span className="text-[24px] font-semibold text-navy font-mono">{row.n[0]}<span className="text-[14px] text-muted">/{row.n[1]}</span></span>
                      <span className="text-[12px] text-muted">{pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={pct} className="mt-2" barClass={row.color}/>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === 'students' && <ClassStudentsTab roster={roster} setRoute={setRoute}/>}
      {tab === 'attendance' && <ClassAttendanceTab/>}
      {tab === 'gradebook' && <PageGradebook initialClassId={cls.id} embedded/>}
      {tab === 'reports' && <ClassReportsTab cls={cls}/>}
    </div>
  );
}

export function ClassStudentsTab({ roster, setRoute }) {
  const [q, setQ] = useState('');
  const filtered = roster.filter(s => !q || `${s.last} ${s.first}`.toLowerCase().includes(q.toLowerCase()) || s.lrn.includes(q));
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name or LRN…" className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"/>
        </div>
        <Btn variant="ghost" size="sm" icon="arrow-up-down">Sort</Btn>
        <Btn variant="ghost" size="sm" icon="filter">Filter</Btn>
        <span className="ml-auto"></span>
        <Btn variant="secondary" size="sm" icon="upload">Import CSV</Btn>
        <Btn variant="primary" size="sm" icon="user-plus">Add student</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-3 py-2 font-semibold w-12">#</th>
              <th className="px-3 py-2 font-semibold">Student</th>
              <th className="px-3 py-2 font-semibold">LRN</th>
              <th className="px-3 py-2 font-semibold">Attendance</th>
              <th className="px-3 py-2 font-semibold">Q3 Grade</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i) => (
              <tr key={s.lrn} className="border-t border-line hover:bg-slate-50/40 cursor-pointer" onClick={() => setRoute('student-profile')}>
                <td className="px-3 py-2 font-mono text-muted">{i+1}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-2.5"><Avatar name={`${s.first} ${s.last}`} size="sm"/><span className="font-semibold text-navy">{s.last}, {s.first} {s.mi}.</span></div></td>
                <td className="px-3 py-2 font-mono text-muted">{s.lrn}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-20"><Progress value={s.att} barClass={s.att>=85?'bg-emerald-500':s.att>=75?'bg-amber-500':'bg-rose-500'}/></div><span className="font-mono text-navy font-semibold">{s.att}%</span></div></td>
                <td className="px-3 py-2"><span className="inline-flex items-center justify-center w-10 h-7 rounded-md font-mono text-[12px] font-bold" style={gradeColor(s.grade)}>{s.grade}</span></td>
                <td className="px-3 py-2"><Badge status={studentStatus(s.att, s.grade)}/></td>
                <td className="px-3 py-2"><Icon name="chevron-right" size={14} className="text-muted"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ClassAttendanceTab() {
  // January 2025 heatmap for the whole class avg
  const stats = {};
  for (let d = 1; d <= 31; d++) {
    const dow = (new Date(2025,0,d)).getDay();
    if (dow === 0 || dow === 6) stats[d] = 'weekend';
    else if (d > 14) stats[d] = 'future';
    else {
      const r = (d*7+3) % 10;
      if (r < 7) stats[d] = 'present';
      else if (r < 8) stats[d] = 'late';
      else if (r < 9) stats[d] = 'absent';
      else stats[d] = 'excused';
    }
  }
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h3 className="text-[15px] font-semibold text-navy">January 2025</h3>
            <p className="text-[12px] text-muted">Daily attendance heatmap — class-wide majority status</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted">
            {['present','late','absent','excused'].map(k => {
              const s = BADGE_STYLES[k];
              return <span key={k} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:s.dot}}/>{s.label}</span>;
            })}
          </div>
        </div>
        <div className="max-w-md">
          <HeatCalendar year={2025} month={0} statuses={stats}/>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-[14px] font-semibold text-navy">Attendance log</h3>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" size="sm" icon="file-text">SF2 Format</Btn>
            <Btn variant="ghost" size="sm" icon="file-spreadsheet">Excel</Btn>
            <Btn variant="ghost" size="sm" icon="printer">PDF</Btn>
          </div>
        </div>
        <table className="w-full text-[12.5px]">
          <thead className="bg-surface text-muted text-left">
            <tr><th className="px-3 py-2 font-semibold">Date</th><th className="px-3 py-2 font-semibold">Present</th><th className="px-3 py-2 font-semibold">Late</th><th className="px-3 py-2 font-semibold">Absent</th><th className="px-3 py-2 font-semibold">Excused</th><th className="px-3 py-2 font-semibold text-right">%</th></tr>
          </thead>
          <tbody>
            {ATTENDANCE_LOG.map((r,i) => (
              <tr key={i} className="border-t border-line hover:bg-slate-50/40">
                <td className="px-3 py-2 font-mono text-navy">{r.date}</td>
                <td className="px-3 py-2"><Badge status="present">{r.present}</Badge></td>
                <td className="px-3 py-2"><Badge status="late">{r.late}</Badge></td>
                <td className="px-3 py-2"><Badge status="absent">{r.absent}</Badge></td>
                <td className="px-3 py-2"><Badge status="excused">{r.excused}</Badge></td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-navy">{r.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function ClassReportsTab({ cls }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { code:'SF2',  name:'SF2 Attendance Record', desc:'Monthly daily attendance per learner, DepEd format.', icon:'clipboard-list' },
        { code:'SF9',  name:'Grade Summary',         desc:`All ${cls.count} students, all components, final ${TEACHER.quarter} grade.`, icon:'graduation-cap' },
        { code:'SF9',  name:'Individual Report Cards',desc:'Per-student SF9 card for parent distribution.',     icon:'file-text' },
        { code:'',     name:'Honor Roll',             desc:'Auto-generated tiers (Highest/High/Honors).',        icon:'award' },
      ].map((r,i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-md bg-primary-light text-primary inline-flex items-center justify-center"><Icon name={r.icon} size={18}/></span>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h4 className="text-[14px] font-semibold text-navy">{r.name}</h4>{r.code && <Badge status="primary">{r.code}</Badge>}</div>
              <p className="text-[12px] text-muted mt-0.5">{r.desc}</p>
              <div className="mt-3 flex items-center gap-2">
                <Btn variant="secondary" size="sm" icon="eye">Preview</Btn>
                <Btn variant="primary" size="sm" icon="download">Generate</Btn>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

