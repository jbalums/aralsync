// @ts-nocheck
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Icon,
  Avatar,
  Badge,
  Card,
  Modal,
  useToast,
  EmptyState,
  Skeleton,
  SectionHeader,
  Btn,
  Select,
  BADGE_STYLES,
} from '../components';
import { useClassLoads, useClassLoad, useClassLoadStudents } from '../modules/classrooms/useClassLoads';
import { useAttendanceByDate }   from '../modules/attendance/useAttendance';
import { useAttendanceStore, canSubmitAttendance } from '../modules/attendance/attendanceStore';
import { useSyncStore }           from '../modules/sync/syncStore';
import { attendanceMutation }     from '../offline/attendanceMutation';

export function PageAttendance() {
  const toast  = useToast();
  const isOnline = useSyncStore((s) => s.isOnline);

  const { session, date, setSession, setDate } = useAttendanceStore();

  const [selectedClassLoadId, setSelectedClassLoadId] = useState('');
  const [marks,    setMarks]    = useState({});
  const [focusIdx, setFocusIdx] = useState(0);
  const [saved,        setSaved]        = useState(false);
  const [summaryOpen,  setSummaryOpen]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);

  // ─── Queries ──────────────────────────────────────────────
  const { data: classLoads = [], isLoading: classLoadsLoading } = useClassLoads();
  const { data: classLoadDetail } = useClassLoad(selectedClassLoadId);

  const {
    data: students = [],
    isLoading: studentsLoading,
  } = useClassLoadStudents(selectedClassLoadId);

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
  } = useAttendanceByDate(selectedClassLoadId, date, session);

  // ─── Auto-select first class load ─────────────────────────
  useEffect(() => {
    if (classLoads.length > 0 && !selectedClassLoadId) {
      setSelectedClassLoadId(classLoads[0].id);
    }
  }, [classLoads, selectedClassLoadId]);

  // ─── Prefill marks from server / clear on selection change ─
  const prefillKeyRef = useRef('');
  const queryKey = `${selectedClassLoadId}-${date}-${session}`;

  useEffect(() => {
    if (prefillKeyRef.current !== queryKey) {
      setMarks({});
      setSaved(false);
    }
  }, [queryKey]);

  useEffect(() => {
    if (!attendanceData || prefillKeyRef.current === queryKey) return;
    prefillKeyRef.current = queryKey;
    const prefill = {};
    for (const rec of attendanceData) {
      prefill[rec.studentId] = rec.status;
    }
    setMarks(prefill);
  }, [attendanceData, queryKey]);

  // ─── Roster (sorted) ──────────────────────────────────────
  const roster = useMemo(
    () => [...students].sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [students],
  );

  // ─── Tally ────────────────────────────────────────────────
  const tally = useMemo(() => {
    const t = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
    roster.forEach((s) => {
      const m = marks[s.id];
      if (m) t[m]++;
      else   t.unmarked++;
    });
    return t;
  }, [marks, roster]);

  const total     = roster.length;
  const markedPct = total ? ((total - tally.unmarked) / total) * 100 : 0;

  const setMark = useCallback((studentId, status) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? undefined : status,
    }));
    setSaved(false);
  }, []);

  const bulkMarkRemainingPresent = () => {
    setMarks((prev) => {
      const next = { ...prev };
      roster.forEach((s) => { if (!next[s.id]) next[s.id] = 'present'; });
      return next;
    });
    setSaved(false);
    toast.push({ type: 'info', message: `Marked ${tally.unmarked} unmarked students as Present` });
  };

  const clearAll = () => { setMarks({}); setSaved(false); };

  // ─── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA' || e.target?.tagName === 'SELECT')
        return;
      const k = e.key.toLowerCase();
      if (k === 'arrowdown') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(roster.length - 1, i + 1));
      } else if (k === 'arrowup') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (['p', 'l', 'a', 'e'].includes(k)) {
        const map = { p: 'present', l: 'late', a: 'absent', e: 'excused' };
        const s = roster[focusIdx];
        if (s) setMark(s.id, map[k]);
      } else if (k === ' ') {
        e.preventDefault();
        const s = roster[focusIdx];
        if (s) setMark(s.id, marks[s.id] === 'present' ? undefined : 'present');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusIdx, roster, marks, setMark]);

  // ─── Schedule gate ────────────────────────────────────────
  const submitGate = canSubmitAttendance(classLoadDetail);

  // ─── Save ─────────────────────────────────────────────────
  const doSave = async () => {
    setSaving(true);
    try {
      const inputs = Object.entries(marks)
        .filter(([, status]) => Boolean(status))
        .map(([studentId, status]) => ({
          classLoadId: selectedClassLoadId,
          studentId,
          date,
          session,
          status,
        }));

      await attendanceMutation(inputs);
      setSaved(true);
      prefillKeyRef.current = queryKey;
      toast.push({
        type:    'success',
        title:   'Attendance saved',
        message: isOnline
          ? `${inputs.length} records uploaded to cloud.`
          : `${inputs.length} records saved locally - will sync when online.`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!submitGate.allowed) {
      setOverrideOpen(true);
      return;
    }
    void doSave();
  };

  const classLoad = classLoads.find((c) => c.id === selectedClassLoadId);
  const isLoading = classLoadsLoading || studentsLoading || attendanceLoading;

  // ─── Empty / loading states ───────────────────────────────
  if (classLoadsLoading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!classLoadsLoading && classLoads.length === 0) {
    return (
      <EmptyState
        icon="book-open"
        title="No class loads"
        message="Create a class load first before taking attendance."
      />
    );
  }

  return (
    <div className="page-anim flex flex-col gap-3 -m-4 sm:-m-6 -mt-4 sm:-mt-6 relative">
      {/* Sticky top bar */}
      <div className="sticky -top-10 z-20 bg-white border-b border-line px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Class selector */}
            <div className="relative">
              <Select
                value={selectedClassLoadId}
                onChange={(e) => setSelectedClassLoadId(e.target.value)}
                className="h-10 pr-9 font-semibold text-[13px] min-w-65"
              >
                {classLoads.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.subject.name} · Grade {cl.subject.gradeLevel} – {cl.section.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date picker */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 px-3 rounded-md border border-line text-[13px] font-medium text-navy bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            {/* AM / PM toggle */}
            <div className="inline-flex rounded-md border border-line bg-white overflow-hidden">
              {['AM', 'PM'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSession(s)}
                  className={`px-3 h-9 text-[12.5px] font-semibold tx ${session === s ? 'bg-navy text-white' : 'text-navy hover:bg-surface'}`}
                >
                  {s} session
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <span
              className="pill"
              style={{
                background: isOnline ? '#ECFDF5' : '#FFFBEB',
                color:      isOnline ? '#065F46' : '#92400E',
              }}
            >
              <span
                className="dot"
                style={{ background: isOnline ? '#10B981' : '#F59E0B' }}
              />
              {isOnline ? 'Online - auto-sync on save' : 'Offline - saving locally'}
            </span>

            <div className="flex items-center gap-2">
              <Btn variant="secondary" icon="list" onClick={() => setSummaryOpen(true)}>
                Summary
              </Btn>
              <Btn
                variant="primary"
                icon={saved ? 'check-circle' : 'save'}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : saved ? (isOnline ? 'Synced' : 'Saved locally') : 'Save & Sync'}
              </Btn>
            </div>
          </div>
        </div>

        {/* Schedule gate warning */}
        {!submitGate.allowed && (
          <div className="mt-2 flex items-center gap-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <Icon name="clock" size={13} className="shrink-0" />
            {submitGate.reason}
          </div>
        )}

        {/* Progress bar (segmented) */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px] text-muted">
            <span>
              <span className="font-semibold text-navy">{total - tally.unmarked}</span>{' '}
              of {total} marked ·{' '}
              <span className="font-mono">{markedPct.toFixed(0)}%</span>
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { k: 'present', color: '#10B981' },
                { k: 'late',    color: '#F59E0B' },
                { k: 'absent',  color: '#EF4444' },
                { k: 'excused', color: '#8B5CF6' },
              ].map(({ k, color }) => (
                <span key={k} className="flex items-center gap-1 font-semibold">
                  <span className="dot" style={{ background: color }} />
                  {tally[k]}{' '}
                  <span className="text-muted font-normal capitalize">{k}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100">
            {[
              { v: tally.present, c: '#10B981' },
              { v: tally.late,    c: '#F59E0B' },
              { v: tally.absent,  c: '#EF4444' },
              { v: tally.excused, c: '#8B5CF6' },
            ].map(({ v, c }, i) => (
              <div key={i} style={{ width: `${(v / total) * 100}%`, background: c }} />
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {tally.unmarked > 0 && (
          <div className="mt-3 flex items-center justify-between gap-2 bg-primary-light/40 border border-primary-light rounded-md px-3 py-2">
            <div className="text-[12.5px] text-primary-dark">
              <span className="font-semibold">{tally.unmarked} students unmarked</span> - common shortcut:
            </div>
            <div className="flex items-center gap-2">
              <Btn size="sm" variant="soft" icon="check" onClick={bulkMarkRemainingPresent}>
                Mark remaining as Present
              </Btn>
              <Btn size="sm" variant="ghost" icon="rotate-ccw" onClick={clearAll}>
                Clear all
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Body: Roster + sidebar */}
      <div className="px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 pb-32 lg:pb-8 relative">
        {/* Roster */}
        <div>
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center gap-2 bg-surface/50">
              {classLoad && (
                <>
                  <span className="text-[13px] font-semibold text-navy">
                    {classLoad.subject.name} · Grade {classLoad.subject.gradeLevel} – {classLoad.section.name}
                  </span>
                  {classLoad.scheduleTime && (
                    <span className="text-[12px] text-muted">· {classLoad.scheduleTime}</span>
                  )}
                </>
              )}
              <span className="ml-auto text-[12px] text-muted">
                {total} students · alphabetical by last name
              </span>
            </div>

            {isLoading ? (
              <div className="p-4 flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            ) : roster.length === 0 ? (
              <EmptyState
                icon="users"
                title="No students"
                message="No students are enrolled in this class load yet."
              />
            ) : (
              <ul className="divide-y divide-line">
                {roster.map((s, idx) => {
                  const mark   = marks[s.id];
                  const isFocus = focusIdx === idx;
                  return (
                    <li
                      key={s.id}
                      onClick={() => setFocusIdx(idx)}
                      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 min-h-16 tx ${idx % 2 === 1 ? 'bg-slate-50/40' : ''} ${isFocus ? 'ring-2 ring-primary/40 ring-inset' : ''}`}
                    >
                      <span className="w-6 text-center text-[11px] font-mono text-muted">
                        {idx + 1}
                      </span>
                      <Avatar name={`${s.firstName} ${s.lastName}`} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-navy leading-tight truncate">
                          {s.lastName}, {s.firstName}{s.middleName ? ` ${s.middleName.slice(0, 1)}.` : ''}
                        </div>
                        <div className="text-[11px] text-muted font-mono">
                          LRN ••• {s.lrn.slice(-4)}
                        </div>
                      </div>
                      {/* Status buttons */}
                      <div className="flex items-center gap-1.5">
                        {[
                          { v: 'present', i: 'check',        t: 'P' },
                          { v: 'late',    i: 'clock-3',      t: 'L' },
                          { v: 'absent',  i: 'x',            t: 'A' },
                          { v: 'excused', i: 'shield-check', t: 'E' },
                        ].map((b) => {
                          const active = mark === b.v;
                          const tone   = BADGE_STYLES[b.v];
                          return (
                            <button
                              key={b.v}
                              onClick={(e) => { e.stopPropagation(); setMark(s.id, b.v); }}
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md border press tx flex flex-col items-center justify-center text-[10px] font-bold ${active ? 'shadow-sm' : 'border-line bg-white hover:bg-surface'}`}
                              style={active ? { background: tone.bg, color: tone.fg, borderColor: tone.dot } : {}}
                              aria-label={`Mark ${b.v}`}
                              title={`${b.v} (${b.t})`}
                            >
                              <Icon name={b.i} size={14} />
                              <span className="mt-0.5">{b.t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Bottom action card */}
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto">
              <div className="flex items-center gap-2 text-[12.5px] text-muted">
                <Icon name="alert-circle" size={14} className="text-amber-600" />
                <span>
                  <span className="font-semibold text-navy">{tally.unmarked}</span> unmarked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="ghost" icon="list" onClick={() => setSummaryOpen(true)}>
                  Summary
                </Btn>
                <Btn
                  variant="primary"
                  size="lg"
                  icon={saved ? 'check-circle' : 'save'}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : saved ? (isOnline ? 'Synced' : 'Saved locally') : 'Save & Sync'}
                </Btn>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-40 self-start">
          <Card className="p-4">
            <SectionHeader title="Live summary" subtitle="Updates as you mark" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: 'present', v: tally.present },
                { k: 'late',    v: tally.late    },
                { k: 'absent',  v: tally.absent  },
                { k: 'excused', v: tally.excused },
              ].map((r) => {
                const s = BADGE_STYLES[r.k];
                return (
                  <div key={r.k} className="rounded-md p-3" style={{ background: s.bg, color: s.fg }}>
                    <div className="text-[11px] uppercase tracking-wider font-semibold">{s.label}</div>
                    <div className="text-[24px] font-semibold mt-1 leading-none">{r.v}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-md border border-dashed border-line p-3 text-[12px] text-muted text-center">
              <span className="font-semibold text-navy">{tally.unmarked}</span> still unmarked
            </div>
          </Card>

          <Card className="p-4">
            <SectionHeader title="Quick shortcuts" subtitle="Click a row to focus · then press" />
            <ul className="space-y-1.5 text-[12.5px]">
              {[
                { k: 'P',    label: 'Mark Present' },
                { k: 'L',    label: 'Mark Late'    },
                { k: 'A',    label: 'Mark Absent'  },
                { k: 'E',    label: 'Mark Excused' },
                { k: '↑/↓',  label: 'Move between students' },
                { k: 'Space',label: 'Toggle present' },
              ].map((r, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-navy">{r.label}</span>
                  <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-line bg-white text-navy">
                    {r.k}
                  </kbd>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <SectionHeader title="Saving offline" subtitle="What happens when you save" />
            <ul className="space-y-2 text-[12.5px]">
              {[
                { icon: 'hard-drive',   text: 'Saved instantly to your device' },
                { icon: 'refresh-cw',   text: 'Queued for sync - even mid-class' },
                { icon: 'cloud-upload', text: 'Uploads when connection returns' },
              ].map(({ icon, text }) => (
                <li key={icon} className="flex items-start gap-2">
                  <Icon name={icon} size={14} className="text-primary mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      {/* Summary modal */}
      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Attendance summary"
        subtitle={classLoad
          ? `${classLoad.subject.name} · ${classLoad.section.name} · ${date} (${session})`
          : date}
      >
        <div className="grid grid-cols-4 gap-3 mb-4">
          {['present', 'late', 'absent', 'excused'].map((k) => {
            const s = BADGE_STYLES[k];
            return (
              <div key={k} className="rounded-md p-3 text-center" style={{ background: s.bg, color: s.fg }}>
                <div className="text-[11px] uppercase tracking-wider font-semibold">{s.label}</div>
                <div className="text-[24px] font-semibold mt-1 leading-none">{tally[k]}</div>
              </div>
            );
          })}
        </div>
        <div className="max-h-75 overflow-y-auto border border-line rounded-md">
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface">
              <tr className="text-left text-muted">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Student</th>
                <th className="px-3 py-2 font-semibold">LRN</th>
                <th className="px-3 py-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s, i) => {
                const m = marks[s.id];
                return (
                  <tr key={s.id} className="border-t border-line/70">
                    <td className="px-3 py-2 font-mono text-muted">{i + 1}</td>
                    <td className="px-3 py-2 text-navy">
                      {s.lastName}, {s.firstName}
                    </td>
                    <td className="px-3 py-2 font-mono text-muted">{s.lrn}</td>
                    <td className="px-3 py-2 text-right">
                      {m ? <Badge status={m} /> : <span className="text-muted">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Override confirmation dialog */}
      <Modal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="Override submission window?"
        subtitle={submitGate.reason}
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] text-navy leading-relaxed">
            You're outside the allowed submission window for this class. Saving
            now will record attendance with a timestamp that falls outside the
            scheduled period. This override is logged.
          </p>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setOverrideOpen(false)}>
              Cancel
            </Btn>
            <Btn
              variant="primary"
              icon="save"
              onClick={() => { setOverrideOpen(false); void doSave(); }}
            >
              Save anyway
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
