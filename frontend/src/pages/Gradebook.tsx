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

// ─── GRADEBOOK ───────────────────────────────────────────

export function PageGradebook({ initialClassId, embedded }) {
  const [classId, setClassId] = useState(initialClassId || CLASSES[0].id);
  const cls = useMemo(() => CLASSES.find(c => c.id === classId) || CLASSES[0], [classId]);
  const [component, setComponent] = useState('ww');     // ww | pt | qa
  const [scores, setScores] = useState(() => buildScores(cls));
  const [editing, setEditing] = useState(null);         // { lrn, key }
  const [dirty, setDirty] = useState({});               // { 'lrn:key': true }
  const [lastSaved, setLastSaved] = useState('a moment ago');
  const [addColOpen, setAddColOpen] = useState(false);
  const toast = useToast();

  // Build score matrix for a class
  function buildScores(cls) {
    const list = STUDENTS_RIZAL.slice(0, cls.count);
    const out = {};
    list.forEach((s, i) => {
      // Deterministic-ish scores from att+grade as seeds
      const seed = (s.grade || 80) - 5;
      const ww = [seed-2, seed-1, seed-3, seed-1].map(v => clamp(v + ((i*7)%6)-2, 50, 100));
      const pt = [seed+5, seed+4, seed+6].map(v => clamp(v + ((i*11)%8)-4, 60, 100));
      const qa = clamp(seed + ((i*13)%8) - 3, 55, 100);
      out[s.lrn] = { ww, pt, qa };
    });
    // Override Juan dela Cruz with the canonical scores from data
    const juan = out['105432100001'];
    if (juan) {
      juan.ww = JUAN_SCORES.ww.map(([a,b]) => Math.round((a/b)*100));
      juan.pt = JUAN_SCORES.pt.map(([a,b]) => Math.round((a/b)*100));
      juan.qa = Math.round((JUAN_SCORES.qa[0]/JUAN_SCORES.qa[1])*100);
    }
    return out;
  }
  function clamp(n,lo,hi){ return Math.max(lo, Math.min(hi, Math.round(n))); }

  useEffect(() => { setScores(buildScores(cls)); setDirty({}); }, [cls.id]);

  const roster = useMemo(
    () => STUDENTS_RIZAL.slice(0, cls.count).slice().sort((a,b) => a.last.localeCompare(b.last)),
    [cls.count]
  );

  // Column config per component
  const colsByComp = {
    ww: [
      { key:'ww0', label:'WW1', max:100, date:'Jan 06' },
      { key:'ww1', label:'WW2', max:100, date:'Jan 09' },
      { key:'ww2', label:'WW3', max:100, date:'Jan 13' },
      { key:'ww3', label:'WW4', max:100, date:'Jan 14' },
    ],
    pt: [
      { key:'pt0', label:'PT1', max:100, date:'Jan 07' },
      { key:'pt1', label:'PT2', max:100, date:'Jan 10' },
      { key:'pt2', label:'PT3', max:100, date:'Jan 13' },
    ],
    qa: [
      { key:'qa',  label:'Quarterly Assessment', max:100, date:'Jan 20 (planned)' },
    ],
  };

  function getVal(s, key) {
    const row = scores[s.lrn] || {};
    if (key === 'qa') return row.qa;
    const [prefix, idx] = [key.slice(0,2), parseInt(key.slice(2))];
    return (row[prefix] || [])[idx];
  }
  function setVal(s, key, val) {
    setScores(prev => {
      const next = { ...prev };
      const row = { ...(next[s.lrn] || { ww:[], pt:[], qa:0 }) };
      if (key === 'qa') row.qa = val;
      else {
        const prefix = key.slice(0,2), idx = parseInt(key.slice(2));
        const arr = [...(row[prefix] || [])];
        arr[idx] = val;
        row[prefix] = arr;
      }
      next[s.lrn] = row;
      return next;
    });
    setDirty(d => ({ ...d, [`${s.lrn}:${key}`]: true }));
  }

  function avg(arr) {
    const xs = (arr || []).filter(n => typeof n === 'number' && !isNaN(n));
    if (!xs.length) return null;
    return xs.reduce((a,b) => a+b, 0) / xs.length;
  }

  function quarterly(s) {
    const row = scores[s.lrn] || {};
    const w = cls.weights;
    const ww = avg(row.ww);
    const pt = avg(row.pt);
    const qa = row.qa;
    const parts = [];
    if (ww != null) parts.push((ww * w.ww)/100);
    if (pt != null) parts.push((pt * w.pt)/100);
    if (qa != null) parts.push((qa * w.qa)/100);
    if (!parts.length) return null;
    const got = parts.reduce((a,b)=>a+b,0);
    // Initial Grade transmuted to DepEd-like: clamp 60-100
    const trans = Math.max(60, Math.min(100, Math.round((got + 0))));
    return trans;
  }

  // Save / auto-save
  const dirtyCount = Object.keys(dirty).length;
  useEffect(() => {
    if (!dirtyCount) return;
    const t = setTimeout(() => {
      setDirty({});
      setLastSaved('just now');
      toast.push({ type:'success', message:`Auto-saved ${dirtyCount} change${dirtyCount>1?'s':''} to device.`, duration: 2400 });
    }, 1800);
    return () => clearTimeout(t);
  }, [dirtyCount]);

  // Stats row
  const compCols = colsByComp[component];
  const studentTotalsForComponent = roster.map(s => {
    const vals = compCols.map(c => getVal(s, c.key)).filter(n => typeof n==='number');
    return { s, vals };
  });
  const flatScores = studentTotalsForComponent.flatMap(r => r.vals);
  const classAvg = flatScores.length ? (flatScores.reduce((a,b)=>a+b,0)/flatScores.length) : 0;
  const passing = roster.filter(s => (quarterly(s) ?? 0) >= 75).length;
  const passingPct = roster.length ? (passing/roster.length)*100 : 0;
  const highScore = flatScores.length ? Math.max(...flatScores) : 0;
  const lowScore  = flatScores.length ? Math.min(...flatScores) : 0;

  const c = SUBJECT_COLORS[cls.subject];

  return (
    <div className="page-anim space-y-5">
      {/* Class tabs */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {CLASSES.map(cc => {
            const active = cc.id === cls.id;
            const cc_c = SUBJECT_COLORS[cc.subject];
            return (
              <button key={cc.id} onClick={() => setClassId(cc.id)} className={`px-3.5 py-2.5 rounded-md text-left tx press min-w-[200px] ${active?'bg-white border-2 shadow-sm':'bg-white border border-line hover:shadow-sm'}`} style={ active ? { borderColor: cc_c.hue } : {}}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{background: cc_c.hue}}/>
                  <span className="text-[12px] font-semibold" style={{color: active ? cc_c.ink : '#0F172A'}}>{cc.subject}</span>
                  {active && <Icon name="circle-check" size={12} className="ml-auto text-primary"/>}
                </div>
                <div className="text-[11px] text-muted mt-1">{cc.grade} · {cc.section} · {cc.count} students</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <SubjectChip subject={cls.subject}/>
              <span className="text-[13px] text-muted">{cls.grade} – {cls.section}</span>
              <QuarterBadge quarter={TEACHER.quarter}/>
            </div>
            <h2 className="text-[20px] font-semibold tracking-tight text-navy mt-2">{cls.subject} gradebook</h2>
            <div className="text-[12px] text-muted mt-0.5">Weights: <span className="font-mono text-navy">WW {cls.weights.ww}%</span> · <span className="font-mono text-navy">PT {cls.weights.pt}%</span> · <span className="font-mono text-navy">QA {cls.weights.qa}%</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill" style={{background: dirtyCount? '#FEF3C7':'#ECFDF5', color: dirtyCount? '#78350F':'#065F46'}}>
              <span className={`dot ${dirtyCount? 'pulse-dot':''}`} style={{background: dirtyCount? '#F59E0B':'#10B981'}}/>
              {dirtyCount ? `${dirtyCount} unsaved · auto-save in 2s` : `Saved · ${lastSaved}`}
            </span>
            <Btn variant="secondary" icon="plus" size="sm" onClick={() => setAddColOpen(true)}>Add column</Btn>
            <Btn variant="ghost" icon="download" size="sm">Export</Btn>
          </div>
        </div>

        {/* Component segmented control */}
        <div className="mt-4 inline-flex rounded-md border border-line bg-white overflow-hidden">
          {[
            { id:'ww', label:`Written Works (${cls.weights.ww}%)`, icon:'pencil-line' },
            { id:'pt', label:`Performance Tasks (${cls.weights.pt}%)`, icon:'wrench' },
            { id:'qa', label:`Quarterly Assessment (${cls.weights.qa}%)`, icon:'file-check' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setComponent(opt.id)} className={`px-3.5 h-9 text-[12.5px] font-semibold inline-flex items-center gap-1.5 tx ${component===opt.id?'bg-primary text-white':'text-navy hover:bg-surface'}`}>
              <Icon name={opt.icon} size={14}/>{opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Grade entry table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto table-scroll">
          <table className="w-full text-[12.5px] border-collapse">
            <thead>
              <tr className="bg-surface text-muted">
                <th className="freeze-col bg-surface text-left font-semibold px-3 py-2.5 w-12">#</th>
                <th className="freeze-col bg-surface text-left font-semibold px-3 py-2.5 min-w-[220px]" style={{left: 48}}>Student</th>
                {compCols.map(col => (
                  <th key={col.key} className="text-center font-semibold px-2 py-2 min-w-[80px]">
                    <div className="text-[12px] text-navy font-semibold">{col.label}</div>
                    <div className="text-[10px] text-muted font-mono">/ {col.max} · {col.date}</div>
                  </th>
                ))}
                <th className="text-center font-semibold px-3 py-2.5 min-w-[80px]">Avg</th>
                <th className="text-center font-semibold px-3 py-2.5 min-w-[100px]">Weighted ({component==='ww'?cls.weights.ww:component==='pt'?cls.weights.pt:cls.weights.qa}%)</th>
                <th className="text-center font-semibold px-3 py-2.5 min-w-[120px] sticky right-0 bg-surface">Q3 Grade</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s, idx) => {
                const compVals = compCols.map(c => getVal(s, c.key));
                const compAvg = avg(compVals);
                const compWeight = component==='ww'?cls.weights.ww:component==='pt'?cls.weights.pt:cls.weights.qa;
                const compW = compAvg!=null ? (compAvg*compWeight)/100 : null;
                const q = quarterly(s);
                const gC = q!=null ? gradeColor(q) : null;
                return (
                  <tr key={s.lrn} className="border-t border-line hover:bg-slate-50/40">
                    <td className="freeze-col bg-white px-3 py-2 font-mono text-muted">{idx+1}</td>
                    <td className="freeze-col bg-white px-3 py-2" style={{left: 48}}>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${s.first} ${s.last}`} size="sm"/>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-navy truncate">{s.last}, {s.first} {s.mi}.</div>
                          <div className="text-[10.5px] text-muted font-mono">LRN ••• {s.lrn.slice(-4)}</div>
                        </div>
                      </div>
                    </td>
                    {compCols.map(col => {
                      const v = getVal(s, col.key);
                      const isEdit = editing && editing.lrn === s.lrn && editing.key === col.key;
                      const isDirty = !!dirty[`${s.lrn}:${col.key}`];
                      return (
                        <td key={col.key} className="px-1 py-1 text-center">
                          {isEdit ? (
                            <input
                              autoFocus
                              defaultValue={v ?? ''}
                              type="number"
                              min={0}
                              max={col.max}
                              onBlur={(e) => { const n = e.target.value === ''? undefined : parseFloat(e.target.value); setVal(s, col.key, n); setEditing(null); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                  const n = e.target.value === ''? undefined : parseFloat(e.target.value);
                                  setVal(s, col.key, n);
                                  // move to next column / row
                                  const i = compCols.findIndex(cc => cc.key === col.key);
                                  if (e.key === 'Tab' && i < compCols.length-1) {
                                    e.preventDefault();
                                    setEditing({ lrn: s.lrn, key: compCols[i+1].key });
                                  } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const nextIdx = idx + 1;
                                    if (nextIdx < roster.length) setEditing({ lrn: roster[nextIdx].lrn, key: col.key });
                                    else setEditing(null);
                                  } else { setEditing(null); }
                                } else if (e.key === 'Escape') setEditing(null);
                              }}
                              className="w-14 h-8 text-center rounded-md border-2 border-amber-400 text-[13px] font-mono font-semibold focus:outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => setEditing({ lrn: s.lrn, key: col.key })}
                              className={`w-14 h-8 rounded-md text-[13px] font-mono font-semibold tx ${v==null? 'text-muted-light bg-slate-50 hover:bg-slate-100' : isDirty? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-white text-navy hover:bg-surface border border-transparent hover:border-line'}`}
                            >
                              {v==null ? '–' : v}
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-mono text-[13px] text-navy font-semibold">{compAvg!=null ? compAvg.toFixed(1) : '–'}</td>
                    <td className="px-3 py-2 text-center font-mono text-[13px] text-muted">{compW!=null ? compW.toFixed(2) : '–'}</td>
                    <td className="px-3 py-2 text-center sticky right-0 bg-white">
                      {q!=null ? (
                        <span className="inline-flex items-center justify-center w-14 h-8 rounded-md font-mono text-[13px] font-bold" style={{ background:gC.bg, color:gC.fg }}>{q}</span>
                      ) : <span className="text-muted-light">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Bottom stats */}
            <tfoot>
              <tr className="bg-surface text-muted">
                <td colSpan={2} className="px-3 py-2.5 font-semibold text-navy">Class summary</td>
                <td colSpan={compCols.length} className="px-3 py-2 text-center text-[11px]">
                  <span className="text-muted">Avg of all entries</span>
                </td>
                <td className="px-3 py-2 text-center font-mono font-semibold text-navy text-[13px]">{classAvg.toFixed(1)}</td>
                <td className="px-3 py-2 text-center text-[11px] text-muted">High <span className="font-mono text-navy font-semibold">{highScore}</span> · Low <span className="font-mono text-navy font-semibold">{lowScore}</span></td>
                <td className="px-3 py-2 text-center sticky right-0 bg-surface">
                  <span className="text-[11px] text-muted">% passing</span>
                  <div className="text-[14px] font-semibold text-navy font-mono">{passingPct.toFixed(0)}%</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Footnote */}
      <div className="text-[12px] text-muted flex items-center gap-2 px-1">
        <Icon name="info" size={13}/> Quarterly Grade = WW({cls.weights.ww}%) + PT({cls.weights.pt}%) + QA({cls.weights.qa}%), transmuted per DepEd table. Passing ≥ 75.
      </div>

      {/* Add column modal */}
      <Modal open={addColOpen} onClose={() => setAddColOpen(false)} title="Add score column"
        subtitle={`${cls.subject} · ${component==='ww'?'Written Works':component==='pt'?'Performance Tasks':'Quarterly Assessment'}`}
        footer={<>
          <Btn variant="ghost" onClick={() => setAddColOpen(false)}>Cancel</Btn>
          <Btn variant="primary" icon="plus" onClick={() => { setAddColOpen(false); toast.push({ type:'success', message:`New ${component==='ww'?'WW':component==='pt'?'PT':'QA'} column added.` }); }}>Add column</Btn>
        </>}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Column name" required><TextInput defaultValue={component==='ww'?'WW5':component==='pt'?'PT4':'QA'} /></Field>
          <Field label="Maximum score" required><TextInput type="number" defaultValue="100"/></Field>
          <Field label="Date given"><TextInput type="date" defaultValue="2025-01-15"/></Field>
          <Field label="Topic / activity"><TextInput placeholder="e.g. Newton's Laws Quiz"/></Field>
        </div>
        <div className="mt-4 p-3 rounded-md bg-primary-light/40 text-[12.5px] text-primary-dark flex items-center gap-2">
          <Icon name="info" size={14}/> Scores auto-contribute to the weighted average.
        </div>
      </Modal>
    </div>
  );
}

