// @ts-nocheck
import React, { useState, useMemo, useCallback, useRef, useEffect, Fragment } from 'react';
import {
  Icon, Card, Modal, useToast, Btn, Field, TextInput, Select, SubjectChip,
} from '../components';
import {
  useWeeklySchedule,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCheckConflict,
} from '../modules/schedules/useSchedules';
import { useClassLoads } from '../modules/classrooms/useClassLoads';
import type { ScheduleBlock, ScheduleType, CreateScheduleInput } from '../modules/schedules/schedules.service';

// ── constants ────────────────────────────────────────────────────────────────
const DAYS    = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_MAP: Record<string, number> = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
const IDX_DAY: Record<number, string> = { 1:'Mon', 2:'Tue', 3:'Wed', 4:'Thu', 5:'Fri', 6:'Sat' };
const DAY_FULL: Record<string, string> = {
  Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday',
  Thu:'Thursday', Fri:'Friday', Sat:'Saturday',
};
const HOURS = [7,8,9,10,11,12,13,14,15,16,17];

// ── colour helpers ────────────────────────────────────────────────────────────
function typeColor(t: ScheduleType | string) {
  return ({
    class:   { bg:'#ECFEFF', border:'#0F766E', text:'#0F766E' },
    duty:    { bg:'#FEF3C7', border:'#B45309', text:'#78350F' },
    meeting: { bg:'#EDE9FE', border:'#6D28D9', text:'#4C1D95' },
    break:   { bg:'#F1F5F9', border:'#64748B', text:'#475569' },
  })[t] ?? { bg:'#F1F5F9', border:'#64748B', text:'#475569' };
}

const SUBJECT_PALETTE = [
  '#0F766E','#1D4ED8','#9333EA','#B45309','#0369A1',
  '#166534','#BE123C','#B45309','#0891B2','#4338CA',
];
function subjectHue(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length];
}

// ── format helpers ────────────────────────────────────────────────────────────
function fmtHour(h: number) { return h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`; }
function fmtHM(h: number, m = 0) {
  const hh = h <= 12 ? h : h - 12;
  const ap = h < 12 ? 'AM' : 'PM';
  return `${h === 12 ? 12 : hh}:${m.toString().padStart(2,'0')} ${ap}`;
}
function parseFmtHM(val: string): { startH: number; startM: number } {
  const [h, m] = val.split(':').map(Number);
  return { startH: h, startM: m };
}

// ── empty draft ───────────────────────────────────────────────────────────────
function emptyDraft(day = 'Mon', hour = 8): Omit<ScheduleBlock, 'id'> {
  return { dayOfWeek: DAY_MAP[day], title:'', section:'', room:'', startH: hour, startM:0, durMin:60, type:'class' };
}

// ── main component ────────────────────────────────────────────────────────────
export function PageSchedules() {
  const toast        = useToast();
  const { data: schedule = [], isLoading } = useWeeklySchedule();
  const { data: classLoads = [] }           = useClassLoads();
  const createSchedule   = useCreateSchedule();
  const updateSchedule   = useUpdateSchedule();
  const deleteSchedule   = useDeleteSchedule();
  const checkConflict    = useCheckConflict();

  const [view,        setView]        = useState<'week' | 'list'>('week');
  const [editing,     setEditing]     = useState<ScheduleBlock | null>(null);
  const [newDraft,    setNewDraft]    = useState<Omit<ScheduleBlock,'id'> | null>(null);
  const [importOpen,  setImportOpen]  = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const conflictDebounce = useRef<ReturnType<typeof setTimeout>>();

  const today = new Date().getDay(); // 0=Sun
  const todayLabel = IDX_DAY[today] ?? '';

  const eventsByDay = useMemo(() => {
    const m: Record<string, ScheduleBlock[]> = {};
    DAYS.forEach(d => { m[d] = []; });
    schedule.forEach(e => {
      const d = IDX_DAY[e.dayOfWeek];
      if (d) m[d].push(e);
    });
    Object.values(m).forEach(arr => arr.sort((a,b) => (a.startH*60+a.startM)-(b.startH*60+b.startM)));
    return m;
  }, [schedule]);

  const totalHours = useMemo(
    () => schedule.filter(e => e.type === 'class').reduce((a,e) => a + e.durMin/60, 0),
    [schedule],
  );

  // conflict check on form change
  const runConflictCheck = useCallback((draft: Partial<ScheduleBlock>, excludeId?: string) => {
    clearTimeout(conflictDebounce.current);
    if (!draft.dayOfWeek || draft.startH === undefined || !draft.durMin) return;
    conflictDebounce.current = setTimeout(async () => {
      try {
        const res = await checkConflict.mutateAsync({
          dayOfWeek: draft.dayOfWeek!,
          startH:    draft.startH!,
          startM:    draft.startM ?? 0,
          durMin:    draft.durMin!,
          excludeId,
        });
        if (res.hasConflict) {
          const names = res.conflicts.map(c => `${c.title} (${fmtHM(c.startH, c.startM)})`).join(', ');
          setConflictMsg(`Conflicts with: ${names}`);
        } else {
          setConflictMsg(null);
        }
      } catch { /* ignore */ }
    }, 300);
  }, [checkConflict]);

  const handleSave = async (form: Omit<ScheduleBlock,'id'> & { id?: string }) => {
    try {
      const input: CreateScheduleInput = {
        title:     form.title,
        section:   form.section,
        room:      form.room,
        dayOfWeek: form.dayOfWeek,
        startH:    form.startH,
        startM:    form.startM,
        durMin:    form.durMin,
        type:      form.type,
        classLoadId: form.classLoadId,
      };
      if (form.id) {
        await updateSchedule.mutateAsync({ id: form.id, input });
        toast.push({ type:'success', message:`Updated · ${form.title}` });
      } else {
        await createSchedule.mutateAsync(input);
        toast.push({ type:'success', message:`Added to ${DAY_FULL[IDX_DAY[form.dayOfWeek]]} · ${form.title}` });
      }
      setEditing(null); setNewDraft(null); setConflictMsg(null);
    } catch {
      toast.push({ type:'error', message:'Failed to save schedule block.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteSchedule.mutateAsync(id);
      setEditing(null); setNewDraft(null);
      toast.push({ type:'warning', message:`Removed · ${title}` });
    } catch {
      toast.push({ type:'error', message:'Failed to delete.' });
    }
  };

  const handleImport = async () => {
    setImportOpen(false);
    let created = 0;
    for (const cl of classLoads) {
      if (!cl.schedule?.dayOfWeek?.length || !cl.schedule?.timeStart) continue;
      const [startH = 7, startM = 0] = cl.schedule.timeStart.split(':').map(Number);
      const [endH = 8, endM = 0] = (cl.schedule.timeEnd ?? '').split(':').map(Number);
      const durMin = Math.max(30, (endH * 60 + endM) - (startH * 60 + startM));
      for (const dow of cl.schedule.dayOfWeek) {
        try {
          await createSchedule.mutateAsync({
            title:       cl.subject?.name ?? cl.subjectName ?? 'Class',
            section:     cl.section?.name ?? cl.sectionName ?? '',
            room:        cl.roomNumber ?? '',
            dayOfWeek:   dow,
            startH,
            startM,
            durMin,
            type:        'class',
            classLoadId: cl.id,
          });
          created++;
        } catch { /* skip conflicts */ }
      }
    }
    toast.push({ type:'success', title:'Schedule rebuilt', message:`Imported ${created} block(s) from class loads.` });
  };

  const editorOpen = !!(editing || newDraft);
  const editorInitial = editing ?? (newDraft ? { ...newDraft } : null);

  return (
    <div className="page-anim space-y-5">
      {/* Header */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-navy">Your weekly schedule</h2>
            <p className="text-[13px] text-muted mt-1">
              {totalHours.toFixed(0)} teaching hours / week across {classLoads.length} class loads.
              Click any cell to add a block.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-md border border-line bg-white overflow-hidden">
              {([
                { id:'week', label:'Week',  icon:'columns-3' },
                { id:'list', label:'Agenda',icon:'list' },
              ] as const).map(o => (
                <button key={o.id} onClick={() => setView(o.id)} className={`px-3 h-9 text-[12.5px] font-semibold inline-flex items-center gap-1.5 tx ${view===o.id?'bg-navy text-white':'text-navy hover:bg-surface'}`}>
                  <Icon name={o.icon} size={14}/>{o.label}
                </button>
              ))}
            </div>
            <Btn variant="secondary" size="sm" icon="upload" onClick={() => setImportOpen(true)}>Import from class loads</Btn>
            <Btn variant="primary"   size="sm" icon="plus"   onClick={() => { setNewDraft(emptyDraft()); setConflictMsg(null); }}>New block</Btn>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 flex-wrap text-[11.5px] text-muted">
          {(['class','duty','meeting','break'] as const).map(t => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: typeColor(t).bg, border:`1px solid ${typeColor(t).border}` }}/>
              {{ class:'Class', duty:'Adviser / duty', meeting:'Meeting', break:'Break' }[t]}
            </span>
          ))}
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6 flex items-center justify-center">
          <Icon name="loader-2" size={20} className="animate-spin text-muted mr-2"/>
          <span className="text-[13px] text-muted">Loading schedule…</span>
        </Card>
      )}

      {/* Week view */}
      {!isLoading && view === 'week' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid min-w-200" style={{ gridTemplateColumns: '64px repeat(6, 1fr)' }}>
              {/* Header */}
              <div className="bg-surface border-b border-line h-12"/>
              {DAYS.map(d => {
                const isToday = d === todayLabel;
                return (
                  <div key={d} className={`bg-surface border-b border-l border-line px-3 py-2 ${isToday?'bg-primary-light/40':''}`}>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted">{d}</div>
                    <div className="text-[14px] font-semibold text-navy">{DAY_FULL[d]}</div>
                    {isToday && <div className="text-[10px] text-primary-dark font-semibold mt-0.5">Today</div>}
                  </div>
                );
              })}
              {/* Body rows */}
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
                      isToday={d === todayLabel}
                      events={(eventsByDay[d] ?? []).filter(e => e.startH === h)}
                      onAdd={() => { setNewDraft(emptyDraft(d, h)); setConflictMsg(null); }}
                      onEdit={(e) => { setEditing(e); setConflictMsg(null); }}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* List / Agenda view */}
      {!isLoading && view === 'list' && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="text-[14px] font-semibold text-navy">Agenda view · {DAYS.length} days</h3>
          </div>
          <ul className="divide-y divide-line">
            {DAYS.filter(d => (eventsByDay[d] ?? []).length).map(d => (
              <li key={d} className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">{DAY_FULL[d]}</div>
                <ul className="space-y-2">
                  {(eventsByDay[d] ?? []).map(e => {
                    const col = typeColor(e.type);
                    return (
                      <li
                        key={e.id}
                        className="flex items-center gap-3 p-2.5 rounded-md border border-line hover:bg-slate-50 cursor-pointer tx"
                        onClick={() => { setEditing(e); setConflictMsg(null); }}
                      >
                        <div className="w-1 h-10 rounded" style={{ background: col.border }}/>
                        <div className="w-24">
                          <div className="text-[12px] font-mono font-semibold text-navy">{fmtHM(e.startH,e.startM)}</div>
                          <div className="text-[10.5px] text-muted">{e.durMin} min</div>
                        </div>
                        {e.type === 'class' && <SubjectChip subject={e.title}/>}
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
            {!DAYS.some(d => (eventsByDay[d] ?? []).length) && (
              <li className="p-8 text-center text-[13px] text-muted">
                No schedule blocks yet. Click "New block" to add one.
              </li>
            )}
          </ul>
        </Card>
      )}

      {/* Event editor modal */}
      {editorOpen && editorInitial && (
        <EventEditor
          initial={editorInitial}
          isNew={!editing}
          conflictMsg={conflictMsg}
          saving={createSchedule.isPending || updateSchedule.isPending}
          deleting={deleteSchedule.isPending}
          onClose={() => { setEditing(null); setNewDraft(null); setConflictMsg(null); }}
          onSave={handleSave}
          onDelete={editing ? () => handleDelete(editing.id, editing.title) : undefined}
          onFieldChange={(draft) => runConflictCheck(draft, editing?.id)}
        />
      )}

      {/* Import modal */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import from class loads"
        subtitle="Creates schedule blocks for each class load's scheduled days."
        footer={
          <>
            <Btn variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Btn>
            <Btn variant="primary" icon="upload" onClick={handleImport}>Import</Btn>
          </>
        }
      >
        <ul className="divide-y divide-line">
          {classLoads.length === 0 && (
            <li className="py-4 text-[13px] text-muted text-center">No class loads found.</li>
          )}
          {classLoads.map(c => (
            <li key={c.id} className="py-2.5 flex items-center gap-3">
              <SubjectChip subject={c.subject?.name ?? c.subjectName ?? '-'}/>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-navy">
                  {c.section?.name ?? c.sectionName ?? '-'}
                </div>
                <div className="text-[11px] text-muted">{c.scheduleTime} · {c.roomNumber}</div>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

// ── DayHourCell ───────────────────────────────────────────────────────────────
function DayHourCell({
  day, hour, isToday, events, onAdd, onEdit,
}: {
  day: string; hour: number; isToday: boolean;
  events: ScheduleBlock[];
  onAdd: () => void;
  onEdit: (e: ScheduleBlock) => void;
}) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onAdd(); }}
      className={`relative border-t border-l border-line h-16 group ${isToday?'bg-primary-light/15':''}`}
    >
      {events.length === 0 && (
        <button
          onClick={onAdd}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 tx flex items-center justify-center text-muted-light hover:bg-primary-light/30"
        >
          <Icon name="plus" size={14}/>
        </button>
      )}
      {events.map(e => {
        const col = typeColor(e.type);
        const top    = (e.startM / 60) * 64;
        const height = (e.durMin / 60) * 64 - 2;
        const accent = e.type === 'class' ? subjectHue(e.title) : col.border;
        return (
          <button
            key={e.id}
            onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
            className="absolute left-1 right-1 rounded-md text-left p-1.5 overflow-hidden tx hover:shadow-md press"
            style={{ top, height, background: col.bg, borderLeft: `3px solid ${accent}`, color: col.text }}
            title={`${e.title} · ${e.section} · ${fmtHM(e.startH, e.startM)}`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <div className="text-[10.5px] font-bold tracking-tight truncate flex-1">{e.title}</div>
              {e.type === 'class'   && <Icon name="book"    size={9}/>}
              {e.type === 'meeting' && <Icon name="users"   size={9}/>}
              {e.type === 'break'   && <Icon name="coffee"  size={9}/>}
              {e.type === 'duty'    && <Icon name="star"    size={9}/>}
            </div>
            <div className="text-[9.5px] truncate opacity-80">{e.section}</div>
            <div className="text-[9px] font-mono opacity-70 mt-0.5">{fmtHM(e.startH, e.startM)} · {e.durMin}m</div>
          </button>
        );
      })}
    </div>
  );
}

// ── EventEditor modal ─────────────────────────────────────────────────────────
function EventEditor({
  initial, isNew, conflictMsg, saving, deleting,
  onClose, onSave, onDelete, onFieldChange,
}: {
  initial:       Partial<ScheduleBlock>;
  isNew:         boolean;
  conflictMsg:   string | null;
  saving:        boolean;
  deleting:      boolean;
  onClose:       () => void;
  onSave:        (form: any) => void;
  onDelete?:     () => void;
  onFieldChange: (draft: Partial<ScheduleBlock>) => void;
}) {
  const [form, setForm] = useState<any>({ ...initial });
  useEffect(() => { setForm({ ...initial }); }, [initial]);

  const set = useCallback((k: string, v: unknown) => {
    setForm((prev: any) => {
      const next = { ...prev, [k]: v };
      onFieldChange(next);
      return next;
    });
  }, [onFieldChange]);

  const dayStr  = IDX_DAY[form.dayOfWeek] ?? 'Mon';
  const timeVal = `${form.startH}:${form.startM ?? 0}`;

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New schedule block' : 'Edit schedule block'}
      subtitle={`${DAY_FULL[dayStr] ?? dayStr} · ${fmtHM(form.startH, form.startM)}`}
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {!isNew && onDelete && (
              <Btn variant="danger" size="sm" icon="trash-2" onClick={onDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Btn>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" icon="save" onClick={() => onSave(form)} disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Add block' : 'Save changes'}
            </Btn>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Block type */}
        <Field label="Block type" required>
          <div className="grid grid-cols-4 gap-1.5">
            {([
              { id:'class',   label:'Class',   icon:'book'   },
              { id:'duty',    label:'Duty',    icon:'star'   },
              { id:'meeting', label:'Meeting', icon:'users'  },
              { id:'break',   label:'Break',   icon:'coffee' },
            ] as const).map(o => {
              const active = form.type === o.id;
              const c = typeColor(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => set('type', o.id)}
                  className="h-12 rounded-md border-2 flex flex-col items-center justify-center gap-0.5 tx press text-[11px] font-semibold"
                  style={active
                    ? { background: c.bg, borderColor: c.border, color: c.text }
                    : { background: '#fff', borderColor: '#E2E8F0', color: '#334155' }
                  }
                >
                  <Icon name={o.icon} size={14}/>
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Title / subject */}
        <Field label={form.type === 'class' ? 'Subject' : 'Label'} required>
          <TextInput
            value={form.title ?? ''}
            onChange={(e) => set('title', e.target.value)}
            placeholder={form.type === 'break' ? 'Lunch break' : form.type === 'meeting' ? 'Faculty meeting' : 'Subject name'}
          />
        </Field>

        {form.type === 'class' && (
          <Field label="Section">
            <TextInput
              value={form.section ?? ''}
              onChange={(e) => set('section', e.target.value)}
              placeholder="Grade 7 – Rizal"
            />
          </Field>
        )}

        {/* Day / time / duration */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Day" required>
            <Select
              value={form.dayOfWeek ?? 1}
              onChange={(e) => set('dayOfWeek', Number(e.target.value))}
            >
              {DAYS.map(d => <option key={d} value={DAY_MAP[d]}>{DAY_FULL[d]}</option>)}
            </Select>
          </Field>
          <Field label="Start time" required>
            <Select
              value={timeVal}
              onChange={(e) => {
                const { startH, startM } = parseFmtHM(e.target.value);
                setForm((prev: any) => {
                  const next = { ...prev, startH, startM };
                  onFieldChange(next);
                  return next;
                });
              }}
            >
              {HOURS.flatMap(h => [
                <option key={`${h}-0`}  value={`${h}:0`}>{fmtHM(h, 0)}</option>,
                <option key={`${h}-30`} value={`${h}:30`}>{fmtHM(h, 30)}</option>,
              ])}
            </Select>
          </Field>
          <Field label="Duration">
            <Select value={form.durMin ?? 60} onChange={(e) => set('durMin', Number(e.target.value))}>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
            </Select>
          </Field>
        </div>

        {/* Room */}
        <Field label="Room / location">
          <TextInput
            value={form.room ?? ''}
            onChange={(e) => set('room', e.target.value)}
            placeholder="Room 104"
          />
        </Field>

        {/* Conflict warning */}
        {conflictMsg && (
          <div className="rounded-md bg-amber-50 border border-amber-300 p-3 text-[12px] text-amber-800 flex items-start gap-2">
            <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0"/>
            {conflictMsg}
          </div>
        )}

        {form.type === 'class' && !conflictMsg && (
          <div className="rounded-md bg-primary-light/40 border border-primary-light p-3 text-[12px] text-primary-dark flex items-center gap-2">
            <Icon name="info" size={14}/>
            This block links to <span className="font-semibold">{form.title || '-'}</span> in your class loads.
          </div>
        )}
      </div>
    </Modal>
  );
}
