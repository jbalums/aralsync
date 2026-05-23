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

// ─── SCHEDULES (timetable builder) ───────────────────────

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_FULL = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday' };
const HOURS = [7,8,9,10,11,12,13,14,15,16,17]; // 7am..5pm

export function PageSchedules() {
  // Seed events from TODAY.schedule across Mon-Fri, mirroring her real classes
  const seed = useMemo(() => buildSeed(), []);
  const [events, setEvents] = useState(seed);
  const [view, setView] = useState('week');         // week | list
  const [editing, setEditing] = useState(null);     // event being edited
  const [newDraft, setNewDraft] = useState(null);   // { day, hour }
  const [importOpen, setImportOpen] = useState(false);
  const toast = useToast();

  function buildSeed() {
    const subjects = TODAY.schedule.map((s,i) => ({
      id: `seed-${i}`,
      day: ['Mon','Tue','Wed','Thu','Fri'][i] || 'Mon',
      title: s.subject,
      section: s.section,
      room: s.room,
      classId: s.classId,
      startH: parseInt(s.time.split(':')[0]) + (s.time.includes('PM') || s.time.startsWith('1:') ? 12 : 0),
      startM: parseInt((s.time.split(':')[1]||'0').slice(0,2)),
      durMin: 60,
      type: 'class',
    }));
    // Add variety across the week using the 4 class loads
    const all = [];
    DAYS.slice(0,5).forEach((d, di) => {
      CLASSES.forEach((c, ci) => {
        const t = c.time.split('–')[0]; // "7:30"
        const [hRaw, mRaw='0'] = t.split(':');
        let h = parseInt(hRaw);
        if (h <= 5) h += 12; // afternoon
        const m = parseInt(mRaw);
        all.push({
          id: `e-${d}-${c.id}`,
          day: d,
          title: c.subject,
          section: `${c.grade} – ${c.section}`,
          room: c.room,
          classId: c.id,
          startH: h,
          startM: m,
          durMin: 60,
          type: 'class',
        });
      });
      // Add break + faculty
      all.push({ id:`brk-${d}`, day:d, title:'Recess', section:'Break', room:'Canteen', startH:9, startM:30, durMin:30, type:'break' });
      all.push({ id:`lun-${d}`, day:d, title:'Lunch break', section:'Break', room:'Canteen', startH:12, startM:0, durMin:60, type:'break' });
      if (di === 2) all.push({ id:`fac-${d}`, day:d, title:'Faculty meeting', section:'Department', room:'Conf. Rm.', startH:15, startM:30, durMin:60, type:'meeting' });
      if (di === 0) all.push({ id:`pe-${d}`, day:d, title:'Homeroom', section:'Adviser', room:'Room 104', startH:7, startM:0, durMin:30, type:'duty' });
    });
    return all;
  }

  const eventsByDay = useMemo(() => {
    const m = {};
    DAYS.forEach(d => m[d] = []);
    events.forEach(e => { if (m[e.day]) m[e.day].push(e); });
    Object.values(m).forEach(arr => arr.sort((a,b) => (a.startH*60+a.startM)-(b.startH*60+b.startM)));
    return m;
  }, [events]);

  const totalHours = useMemo(() => {
    return events.filter(e => e.type==='class').reduce((a,e) => a + e.durMin/60, 0);
  }, [events]);

  const handleCellClick = (day, hour) => {
    setNewDraft({ day, hour, startM: 0 });
  };

  const handleSave = (draft) => {
    if (draft.id) {
      setEvents(prev => prev.map(e => e.id === draft.id ? draft : e));
      toast.push({ type:'success', message:`Updated · ${draft.title}` });
    } else {
      const e = { ...draft, id: `usr-${Date.now()}` };
      setEvents(prev => [...prev, e]);
      toast.push({ type:'success', message:`Added to ${DAY_FULL[draft.day]} · ${draft.title}` });
    }
    setEditing(null); setNewDraft(null);
  };

  const handleDelete = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setEditing(null); setNewDraft(null);
    toast.push({ type:'warning', message:'Removed from schedule.' });
  };

  return (
    <div className="page-anim space-y-5">
      {/* Header */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold tracking-[0.16em] uppercase text-primary">{TEACHER.schoolYear} · {TEACHER.quarter}</span>
              <QuarterBadge quarter={TEACHER.quarter}/>
            </div>
            <h2 className="text-[22px] font-semibold tracking-tight text-navy mt-1">Your weekly schedule</h2>
            <p className="text-[13px] text-muted mt-1">{totalHours.toFixed(0)} teaching hours / week across {CLASSES.length} class loads. Click any cell to add a block.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-md border border-line bg-white overflow-hidden">
              {[
                { id:'week', label:'Week',  icon:'columns-3' },
                { id:'list', label:'Agenda',icon:'list' },
              ].map(o => (
                <button key={o.id} onClick={() => setView(o.id)} className={`px-3 h-9 text-[12.5px] font-semibold inline-flex items-center gap-1.5 tx ${view===o.id?'bg-navy text-white':'text-navy hover:bg-surface'}`}>
                  <Icon name={o.icon} size={14}/>{o.label}
                </button>
              ))}
            </div>
            <Btn variant="secondary" size="sm" icon="upload" onClick={() => setImportOpen(true)}>Import from class loads</Btn>
            <Btn variant="primary" size="sm" icon="plus" onClick={() => setNewDraft({ day:'Mon', hour:8, startM:0 })}>New block</Btn>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 flex-wrap text-[11.5px] text-muted">
          {[
            { t:'class',   label:'Class' },
            { t:'duty',    label:'Adviser / duty' },
            { t:'meeting', label:'Meeting' },
            { t:'break',   label:'Break' },
          ].map(r => (
            <span key={r.t} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: typeColor(r.t).bg, border:`1px solid ${typeColor(r.t).border}` }}/>
              {r.label}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-muted"><Icon name="info" size={12}/> Drag-free editor — tap to edit, hold a block's edge to resize (coming).</span>
        </div>
      </Card>

      {view === 'week' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid min-w-[820px]" style={{ gridTemplateColumns: '64px repeat(6, 1fr)' }}>
              {/* Header row */}
              <div className="bg-surface border-b border-line h-12"></div>
              {DAYS.map(d => {
                const isToday = d === 'Tue';
                return (
                  <div key={d} className={`bg-surface border-b border-l border-line px-3 py-2 ${isToday?'bg-primary-light/40':''}`}>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted">{d}</div>
                    <div className="text-[14px] font-semibold text-navy">{DAY_FULL[d]}</div>
                    {isToday && <div className="text-[10px] text-primary-dark font-semibold mt-0.5">Today</div>}
                  </div>
                );
              })}

              {/* Body rows: one row per hour */}
              {HOURS.map(h => (
                <Fragment key={h}>
                  <div className="border-t border-line px-2 py-1 text-right">
                    <div className="text-[10.5px] font-mono text-muted">{fmtHour(h)}</div>
                  </div>
                  {DAYS.map(d => (
                    <DayHourCell
                      key={`${d}-${h}`}
                      day={d}
                      hour={h}
                      events={eventsByDay[d].filter(e => e.startH === h)}
                      onAdd={() => handleCellClick(d, h)}
                      onEdit={setEditing}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </Card>
      )}

      {view === 'list' && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-line"><h3 className="text-[14px] font-semibold text-navy">Agenda view · {DAYS.length} days</h3></div>
          <ul className="divide-y divide-line">
            {DAYS.filter(d => eventsByDay[d].length).map(d => (
              <li key={d} className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">{DAY_FULL[d]}</div>
                <ul className="space-y-2">
                  {eventsByDay[d].map(e => {
                    const col = typeColor(e.type);
                    return (
                      <li key={e.id} className="flex items-center gap-3 p-2.5 rounded-md border border-line hover:bg-slate-50 cursor-pointer tx" onClick={() => setEditing(e)}>
                        <div className="w-1 h-10 rounded" style={{ background: col.border }}/>
                        <div className="w-24">
                          <div className="text-[12px] font-mono font-semibold text-navy">{fmtHM(e.startH,e.startM)}</div>
                          <div className="text-[10.5px] text-muted">{e.durMin} min</div>
                        </div>
                        {e.type==='class' && SUBJECT_COLORS[e.title] && <SubjectChip subject={e.title}/>}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-navy truncate">{e.title}</div>
                          <div className="text-[11px] text-muted truncate">{e.section} · {e.room}</div>
                        </div>
                        <Icon name="chevron-right" size={14} className="text-muted"/>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Editor modal */}
      <EventEditor
        open={!!(editing || newDraft)}
        event={editing || (newDraft ? { day:newDraft.day, title:'', section:'', room:'', startH: newDraft.hour, startM: newDraft.startM||0, durMin:60, type:'class' } : null)}
        isNew={!editing}
        onClose={() => { setEditing(null); setNewDraft(null); }}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing.id) : null}
      />

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import from class loads"
        subtitle="Pull in all of your assigned classes — they'll be added Monday through Friday."
        footer={<>
          <Btn variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Btn>
          <Btn variant="primary" icon="upload" onClick={() => { setImportOpen(false); setEvents(buildSeed()); toast.push({ type:'success', title:'Schedule rebuilt', message:'Imported from your 4 class loads.' }); }}>Import</Btn>
        </>}>
        <ul className="divide-y divide-line">
          {CLASSES.map(c => (
            <li key={c.id} className="py-2.5 flex items-center gap-3">
              <SubjectChip subject={c.subject}/>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-navy">{c.grade} – {c.section}</div>
                <div className="text-[11px] text-muted">{c.time} · {c.room}</div>
              </div>
              <Badge status="primary">Mon–Fri</Badge>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

function fmtHour(h) { return h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`; }
function fmtHM(h, m=0) {
  const hh = h <= 12 ? h : h-12;
  const ap = h < 12 ? 'AM' : 'PM';
  const display = h === 12 ? 12 : hh;
  return `${display}:${m.toString().padStart(2,'0')} ${ap}`;
}
function typeColor(t) {
  return ({
    class:   { bg:'#ECFEFF', border:'#0F766E', text:'#0F766E' },
    duty:    { bg:'#FEF3C7', border:'#B45309', text:'#78350F' },
    meeting: { bg:'#EDE9FE', border:'#6D28D9', text:'#4C1D95' },
    break:   { bg:'#F1F5F9', border:'#64748B', text:'#475569' },
  })[t] || { bg:'#F1F5F9', border:'#64748B', text:'#475569' };
}

function DayHourCell({ day, hour, events, onAdd, onEdit }) {
  const isToday = day === 'Tue';
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onAdd(); }}
      className={`relative border-t border-l border-line h-16 group ${isToday?'bg-primary-light/15':''}`}
    >
      {events.length === 0 && (
        <button onClick={onAdd} className="absolute inset-0 opacity-0 group-hover:opacity-100 tx flex items-center justify-center text-muted-light hover:bg-primary-light/30">
          <Icon name="plus" size={14}/>
        </button>
      )}
      {events.map(e => {
        const col = typeColor(e.type);
        const top = (e.startM / 60) * 64; // 64px per hour
        const height = (e.durMin / 60) * 64 - 2;
        const subjectAccent = e.type==='class' && SUBJECT_COLORS[e.title] ? SUBJECT_COLORS[e.title].hue : col.border;
        return (
          <button
            key={e.id}
            onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
            className="absolute left-1 right-1 rounded-md text-left p-1.5 overflow-hidden tx hover:shadow-md press"
            style={{ top, height, background: col.bg, borderLeft: `3px solid ${subjectAccent}`, color: col.text }}
            title={`${e.title} · ${e.section} · ${fmtHM(e.startH, e.startM)}`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <div className="text-[10.5px] font-bold tracking-tight truncate flex-1">{e.title}</div>
              {e.type === 'class' && <Icon name="book" size={9}/>}
              {e.type === 'meeting' && <Icon name="users" size={9}/>}
              {e.type === 'break' && <Icon name="coffee" size={9}/>}
              {e.type === 'duty' && <Icon name="star" size={9}/>}
            </div>
            <div className="text-[9.5px] truncate opacity-80">{e.section}</div>
            <div className="text-[9px] font-mono opacity-70 mt-0.5">{fmtHM(e.startH, e.startM)} · {e.durMin}m</div>
          </button>
        );
      })}
    </div>
  );
}

function EventEditor({ open, event, isNew, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(event);
  useEffect(() => { setForm(event); }, [event]);
  if (!open || !form) return null;

  const set = (k,v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Modal open={open} onClose={onClose}
      title={isNew ? 'New schedule block' : 'Edit schedule block'}
      subtitle={`${DAY_FULL[form.day]} · ${fmtHM(form.startH, form.startM)}`}
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {!isNew && onDelete && (
              <Btn variant="danger" size="sm" icon="trash-2" onClick={onDelete}>Delete</Btn>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" icon="save" onClick={() => onSave(form)}>{isNew?'Add block':'Save changes'}</Btn>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <Field label="Block type" required>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id:'class',  label:'Class',   icon:'book' },
              { id:'duty',   label:'Duty',    icon:'star' },
              { id:'meeting',label:'Meeting', icon:'users' },
              { id:'break',  label:'Break',   icon:'coffee' },
            ].map(o => {
              const active = form.type === o.id;
              const c = typeColor(o.id);
              return (
                <button key={o.id} onClick={() => set('type', o.id)} className={`h-12 rounded-md border-2 flex flex-col items-center justify-center gap-0.5 tx press text-[11px] font-semibold`} style={ active ? { background:c.bg, borderColor:c.border, color:c.text } : { background:'#fff', borderColor:'#E2E8F0', color:'#334155' }}>
                  <Icon name={o.icon} size={14}/>
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>

        {form.type === 'class' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject" required>
              <Select value={form.title} onChange={(e) => set('title', e.target.value)}>
                <option value="">Select…</option>
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                <option>Araling Panlipunan</option>
                <option>MAPEH</option>
                <option>EsP</option>
                <option>TLE</option>
              </Select>
            </Field>
            <Field label="Section" required>
              <Select value={form.section} onChange={(e) => set('section', e.target.value)}>
                <option value="">Select…</option>
                {CLASSES.map(c => <option key={c.id} value={`${c.grade} – ${c.section}`}>{c.grade} – {c.section}</option>)}
              </Select>
            </Field>
          </div>
        ) : (
          <Field label="Label" required>
            <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={form.type==='break'?'Lunch break':'Faculty meeting'}/>
          </Field>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Field label="Day" required>
            <Select value={form.day} onChange={(e) => set('day', e.target.value)}>
              {DAYS.map(d => <option key={d} value={d}>{DAY_FULL[d]}</option>)}
            </Select>
          </Field>
          <Field label="Start time" required>
            <Select value={`${form.startH}:${form.startM}`} onChange={(e) => { const [h,m] = e.target.value.split(':').map(Number); set('startH', h); set('startM', m); }}>
              {HOURS.flatMap(h => [
                <option key={`${h}-0`}  value={`${h}:0`}>{fmtHM(h,0)}</option>,
                <option key={`${h}-30`} value={`${h}:30`}>{fmtHM(h,30)}</option>,
              ])}
            </Select>
          </Field>
          <Field label="Duration">
            <Select value={form.durMin} onChange={(e) => set('durMin', parseInt(e.target.value))}>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
            </Select>
          </Field>
        </div>

        <Field label="Room / location">
          <TextInput value={form.room} onChange={(e) => set('room', e.target.value)} placeholder="Room 104"/>
        </Field>

        {form.type === 'class' && (
          <div className="rounded-md bg-primary-light/40 border border-primary-light p-3 text-[12px] text-primary-dark flex items-center gap-2">
            <Icon name="info" size={14}/> This block links to <span className="font-semibold">{form.title || '—'}</span> in your class loads.
          </div>
        )}
      </div>
    </Modal>
  );
}

