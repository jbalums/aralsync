// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Icon, Avatar, QuarterBadge, Card, Modal, useToast,
  EmptyState, Skeleton, SubjectChip, gradeColor,
  SectionHeader, Btn, Tabs, Field, TextInput, Select,
} from '../components';
import { useClassLoads }     from '../modules/classrooms/useClassLoads';
import {
  useGradeMatrix, useComputeGrades, useFinalizeGrades, useClassReport,
} from '../modules/gradebook/useGradebook';
import { useGradebookStore }  from '../modules/gradebook/gradebookStore';
import { gradeEntryMutation } from '../offline/gradeEntryMutation';
import { computeQuarterlyGrade } from '../shared/utils/gradeCompute';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export function PageGradebook() {
  const toast = useToast();

  const { activeQuarter, setActiveQuarter, setFinalized } = useGradebookStore();
  const [selectedClassLoadId, setSelectedClassLoadId] = useState('');
  const [component,   setComponent]   = useState('WW');   // WW | PT | QA
  const [localScores, setLocalScores] = useState({});     // { [studentId]: { [colId]: number | null } }
  const [dirty,       setDirty]       = useState({});     // { [`${studentId}:${colId}`]: true }
  const [editing,     setEditing]     = useState(null);   // { studentId, columnId }
  const [addColOpen,  setAddColOpen]  = useState(false);
  const [addColForm,  setAddColForm]  = useState({ component: 'WW', columnLabel: '', maxScore: 100 });
  const [addedColumns, setAddedColumns] = useState([]);   // locally-added columns not yet in server matrix
  const [lastSaved,   setLastSaved]   = useState('a moment ago');
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [reportOpen,  setReportOpen]  = useState(false);

  // ─── Queries ──────────────────────────────────────────────
  const { data: classLoads = [], isLoading: classLoadsLoading } = useClassLoads();
  const { data: matrix, isLoading: matrixLoading } = useGradeMatrix(selectedClassLoadId, activeQuarter);
  const { data: classReport } = useClassReport(selectedClassLoadId, activeQuarter);
  const computeGrades   = useComputeGrades();
  const finalizeGrades  = useFinalizeGrades();

  // ─── Auto-select first class load ─────────────────────────
  useEffect(() => {
    if (classLoads.length > 0 && !selectedClassLoadId) {
      setSelectedClassLoadId(classLoads[0].id);
    }
  }, [classLoads, selectedClassLoadId]);

  // ─── Init localScores from matrix (once per class+quarter) ─
  const matrixKeyRef = useRef('');
  const matrixKey    = `${selectedClassLoadId}-${activeQuarter}`;

  useEffect(() => {
    if (!matrix || matrixKeyRef.current === matrixKey) return;
    matrixKeyRef.current = matrixKey;

    const newScores = {};
    for (const row of matrix.rows) {
      newScores[row.student.id] = {};
      for (const col of matrix.columns) {
        newScores[row.student.id][col.id] = row.scores[col.id]?.score ?? null;
      }
    }
    setLocalScores(newScores);
    setDirty({});
    setAddedColumns([]);
    setFinalized(matrix.isFinalized);
  }, [matrix, matrixKey, setFinalized]);

  // Clear key on selection change so next load re-initializes
  useEffect(() => {
    if (matrixKeyRef.current !== matrixKey) {
      matrixKeyRef.current = '';
    }
  }, [matrixKey]);

  // ─── All columns (server + locally added) ─────────────────
  const allColumns = useMemo(() => [
    ...(matrix?.columns ?? []),
    ...addedColumns,
  ], [matrix, addedColumns]);

  // ─── Columns for active component tab ─────────────────────
  const compCols = useMemo(
    () => allColumns.filter((c) => c.component === component),
    [allColumns, component],
  );

  // ─── Weights ──────────────────────────────────────────────
  const weights = matrix?.weights ?? { ww: 0.2, pt: 0.6, qa: 0.2 };

  // ─── Score accessors ──────────────────────────────────────
  const getScore = useCallback((studentId, columnId) =>
    localScores[studentId]?.[columnId] ?? null,
  [localScores]);

  const setScore = useCallback((studentId, columnId, value) => {
    setLocalScores((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [columnId]: value },
    }));
    setDirty((prev) => ({ ...prev, [`${studentId}:${columnId}`]: true }));
  }, []);

  // ─── Live quarterly grade (client-side) ───────────────────
  const getStudentGrade = useCallback((studentId) => {
    const wwScores = [], ptScores = [];
    let qaScore = null;
    for (const col of allColumns) {
      const score = localScores[studentId]?.[col.id] ?? null;
      if (score === null) continue;
      const entry = { score, max: col.maxScore };
      if (col.component === 'WW') wwScores.push(entry);
      else if (col.component === 'PT') ptScores.push(entry);
      else if (col.component === 'QA') qaScore = entry;
    }
    if (!wwScores.length && !ptScores.length && !qaScore) return null;
    return computeQuarterlyGrade(wwScores, ptScores, qaScore ?? { score: 0, max: 1 }, weights);
  }, [localScores, allColumns, weights]);

  // ─── Roster (from matrix rows) ────────────────────────────
  const roster = matrix?.rows?.map((r) => r.student) ?? [];

  // ─── Class stats ──────────────────────────────────────────
  const { classAvg, passing, passingPct, highScore, lowScore } = useMemo(() => {
    const compScores = roster.flatMap((s) =>
      compCols.map((c) => getScore(s.id, c.id)).filter((v) => v !== null),
    );
    const grades = roster.map((s) => getStudentGrade(s.id)?.transmutedGrade).filter((v) => v != null);
    const passing = grades.filter((g) => g >= 75).length;
    return {
      classAvg:   compScores.length ? compScores.reduce((a, b) => a + b, 0) / compScores.length : 0,
      passing,
      passingPct: roster.length ? (passing / roster.length) * 100 : 0,
      highScore:  compScores.length ? Math.max(...compScores) : 0,
      lowScore:   compScores.length ? Math.min(...compScores) : 0,
    };
  }, [roster, compCols, getScore, getStudentGrade]);

  // ─── 1.8s debounce save ────────────────────────────────────
  const dirtyCount = Object.keys(dirty).length;
  useEffect(() => {
    if (!dirtyCount || !selectedClassLoadId) return;
    const t = setTimeout(async () => {
      const inputs = [];
      for (const key of Object.keys(dirty)) {
        const [studentId, columnId] = key.split(':');
        const col = allColumns.find((c) => c.id === columnId);
        if (!col) continue;
        const score = localScores[studentId]?.[columnId];
        if (score === null || score === undefined) continue;
        inputs.push({
          classLoadId: selectedClassLoadId,
          studentId,
          quarter: activeQuarter,
          component: col.component,
          columnLabel: col.columnLabel,
          maxScore: col.maxScore,
          score,
        });
      }
      if (!inputs.length) return;
      await gradeEntryMutation(inputs);
      setDirty({});
      setLastSaved('just now');
      toast.push({
        type:     'success',
        message:  `Auto-saved ${inputs.length} change${inputs.length > 1 ? 's' : ''} to device.`,
        duration: 2400,
      });
    }, 1800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyCount]);

  // ─── Auto-suggest next column label ───────────────────────
  useEffect(() => {
    const existing = allColumns.filter((c) => c.component === addColForm.component);
    const prefix   = addColForm.component; // WW, PT, or QA
    const nextNum  = existing.length + 1;
    const suggested = prefix === 'QA' ? 'QA' : `${prefix}${nextNum}`;
    setAddColForm((f) => ({ ...f, columnLabel: suggested }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addColForm.component, addColOpen]);

  const handleAddColumn = () => {
    if (!addColForm.columnLabel) return;
    const colId = `${addColForm.component}-${addColForm.columnLabel}`;
    if (allColumns.find((c) => c.id === colId)) {
      toast.push({ type: 'error', message: `Column ${addColForm.columnLabel} already exists` });
      return;
    }
    const newCol = { id: colId, component: addColForm.component, columnLabel: addColForm.columnLabel, maxScore: addColForm.maxScore };
    setAddedColumns((prev) => [...prev, newCol]);
    // Initialize null scores for all students
    setLocalScores((prev) => {
      const next = { ...prev };
      for (const s of roster) {
        next[s.id] = { ...(next[s.id] ?? {}), [colId]: null };
      }
      return next;
    });
    setAddColOpen(false);
    setComponent(addColForm.component);
    toast.push({ type: 'success', message: `Column ${addColForm.columnLabel} added - enter scores to save` });
  };

  const handleComputeGrades = async () => {
    await computeGrades.mutateAsync({ classLoadId: selectedClassLoadId, quarter: activeQuarter });
    toast.push({ type: 'success', title: 'Grades computed', message: 'Quarterly grades saved. Check the Class Report.' });
  };

  const handleFinalize = async () => {
    await finalizeGrades.mutateAsync({ classLoadId: selectedClassLoadId, quarter: activeQuarter });
    setFinalized(true);
    setConfirmFinalizeOpen(false);
    toast.push({ type: 'success', title: 'Quarter finalized', message: 'Grades are now locked. Contact school admin to undo.' });
  };

  const classLoad = classLoads.find((cl) => cl.id === selectedClassLoadId);
  const isFinalized = matrix?.isFinalized ?? false;

  // ─── Loading/empty states ─────────────────────────────────
  if (classLoadsLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }
  if (!classLoads.length) {
    return <EmptyState icon="book-open" title="No class loads" message="Create a class load before entering grades." />;
  }

  return (
    <div className="page-anim space-y-5">
      {/* Class load tab strip */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {classLoads.map((cl) => {
            const active = cl.id === selectedClassLoadId;
            return (
              <button
                key={cl.id}
                onClick={() => setSelectedClassLoadId(cl.id)}
                className={`px-3.5 py-2.5 rounded-md text-left tx press min-w-50 ${active ? 'bg-white border-2 border-primary shadow-sm' : 'bg-white border border-line hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-navy">{cl.subject.name}</span>
                  {active && <Icon name="circle-check" size={12} className="ml-auto text-primary" />}
                </div>
                <div className="text-[11px] text-muted mt-1">
                  Grade {cl.subject.gradeLevel} · {cl.section.name} · {cl.studentCount} students
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header card */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            {classLoad && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] text-muted">
                  Grade {classLoad.subject.gradeLevel} – {classLoad.section.name}
                </span>
              </div>
            )}
            <h2 className="text-[20px] font-semibold tracking-tight text-navy mt-1">
              {classLoad?.subject.name ?? '-'} gradebook
            </h2>
            {classLoad && (
              <div className="text-[12px] text-muted mt-0.5">
                Weights:{' '}
                <span className="font-mono text-navy">WW {Math.round(weights.ww * 100)}%</span> ·{' '}
                <span className="font-mono text-navy">PT {Math.round(weights.pt * 100)}%</span> ·{' '}
                <span className="font-mono text-navy">QA {Math.round(weights.qa * 100)}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quarter selector */}
            <div className="inline-flex rounded-md border border-line bg-white overflow-hidden">
              {QUARTERS.map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q)}
                  className={`px-3 h-8 text-[12px] font-semibold tx ${activeQuarter === q ? 'bg-navy text-white' : 'text-navy hover:bg-surface'}`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Save indicator */}
            <span
              className="pill"
              style={{
                background: dirtyCount ? '#FEF3C7' : '#ECFDF5',
                color:      dirtyCount ? '#78350F'  : '#065F46',
              }}
            >
              <span
                className={`dot ${dirtyCount ? 'pulse-dot' : ''}`}
                style={{ background: dirtyCount ? '#F59E0B' : '#10B981' }}
              />
              {dirtyCount ? `${dirtyCount} unsaved · auto-save in 2s` : `Saved · ${lastSaved}`}
            </span>

            {!isFinalized && (
              <Btn variant="secondary" icon="plus" size="sm" onClick={() => setAddColOpen(true)}>
                Add column
              </Btn>
            )}

            <Btn variant="ghost" icon="bar-chart-2" size="sm" onClick={() => setReportOpen(true)}>
              Class report
            </Btn>

            {!isFinalized && (
              <Btn
                variant="soft"
                icon="calculator"
                size="sm"
                onClick={handleComputeGrades}
                disabled={computeGrades.isPending}
              >
                Compute grades
              </Btn>
            )}

            {!isFinalized && (
              <Btn
                variant="ghost"
                icon="lock"
                size="sm"
                onClick={() => setConfirmFinalizeOpen(true)}
                className="text-amber-700 hover:bg-amber-50"
              >
                Finalize
              </Btn>
            )}

            {isFinalized && (
              <span className="pill bg-amber-50 text-amber-800">
                <Icon name="lock" size={12} className="mr-1" /> Finalized
              </span>
            )}
          </div>
        </div>

        {/* Component segmented control */}
        <div className="mt-4 inline-flex rounded-md border border-line bg-white overflow-hidden">
          {[
            { id: 'WW', label: `Written Works (${Math.round(weights.ww * 100)}%)`, icon: 'pencil-line' },
            { id: 'PT', label: `Performance Tasks (${Math.round(weights.pt * 100)}%)`, icon: 'wrench' },
            { id: 'QA', label: `Quarterly Assessment (${Math.round(weights.qa * 100)}%)`, icon: 'file-check' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setComponent(opt.id)}
              className={`px-3.5 h-9 text-[12.5px] font-semibold inline-flex items-center gap-1.5 tx ${component === opt.id ? 'bg-primary text-white' : 'text-navy hover:bg-surface'}`}
            >
              <Icon name={opt.icon} size={14} /> {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Grade entry table */}
      <Card className="overflow-hidden">
        {matrixLoading ? (
          <div className="p-4 flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
          </div>
        ) : !roster.length ? (
          <EmptyState icon="users" title="No students" message="No students enrolled in this class load." />
        ) : (
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-[12.5px] border-collapse">
              <thead>
                <tr className="bg-surface text-muted">
                  <th className="freeze-col bg-surface text-left font-semibold px-3 py-2.5 w-12">#</th>
                  <th className="freeze-col bg-surface text-left font-semibold px-3 py-2.5 min-w-55" style={{ left: 48 }}>Student</th>
                  {compCols.map((col) => (
                    <th key={col.id} className="text-center font-semibold px-2 py-2 min-w-20">
                      <div className="text-[12px] text-navy font-semibold">{col.columnLabel}</div>
                      <div className="text-[10px] text-muted font-mono">/ {col.maxScore}</div>
                    </th>
                  ))}
                  {!compCols.length && (
                    <th className="px-4 py-3 text-[12px] text-muted font-normal text-center">
                      No columns yet - click "Add column"
                    </th>
                  )}
                  <th className="text-center font-semibold px-3 py-2.5 min-w-20">Avg</th>
                  <th className="text-center font-semibold px-3 py-2.5 min-w-25">
                    Weighted ({component === 'WW' ? Math.round(weights.ww * 100) : component === 'PT' ? Math.round(weights.pt * 100) : Math.round(weights.qa * 100)}%)
                  </th>
                  <th className="text-center font-semibold px-3 py-2.5 min-w-30 sticky right-0 bg-surface">Q Grade</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((student, idx) => {
                  const compScores = compCols.map((c) => getScore(student.id, c.id)).filter((v) => v !== null);
                  const compAvg    = compScores.length ? compScores.reduce((a, b) => a + b, 0) / compScores.length : null;
                  const compWeight = component === 'WW' ? weights.ww : component === 'PT' ? weights.pt : weights.qa;
                  const compW      = compAvg !== null ? (compAvg / 100) * compWeight * 100 : null;
                  const grade      = getStudentGrade(student.id);
                  const gColor     = grade ? gradeColor(grade.transmutedGrade) : null;

                  return (
                    <tr key={student.id} className="border-t border-line hover:bg-slate-50/40">
                      <td className="freeze-col bg-white px-3 py-2 font-mono text-muted">{idx + 1}</td>
                      <td className="freeze-col bg-white px-3 py-2" style={{ left: 48 }}>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-navy truncate">
                              {student.lastName}, {student.firstName}{student.middleInitial ? ` ${student.middleInitial}.` : ''}
                            </div>
                            <div className="text-[10.5px] text-muted font-mono">LRN ••• {student.lrn.slice(-4)}</div>
                          </div>
                        </div>
                      </td>
                      {compCols.map((col) => {
                        const v      = getScore(student.id, col.id);
                        const isEdit = editing?.studentId === student.id && editing?.columnId === col.id;
                        const isDirty = !!dirty[`${student.id}:${col.id}`];
                        return (
                          <td key={col.id} className="px-1 py-1 text-center">
                            {isEdit && !isFinalized ? (
                              <input
                                autoFocus
                                defaultValue={v ?? ''}
                                type="number"
                                min={0}
                                max={col.maxScore}
                                onBlur={(e) => {
                                  const n = e.target.value === '' ? null : parseFloat(e.target.value);
                                  setScore(student.id, col.id, n);
                                  setEditing(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Tab') {
                                    const n = e.target.value === '' ? null : parseFloat(e.target.value);
                                    setScore(student.id, col.id, n);
                                    const ci = compCols.findIndex((c) => c.id === col.id);
                                    if (e.key === 'Tab' && ci < compCols.length - 1) {
                                      e.preventDefault();
                                      setEditing({ studentId: student.id, columnId: compCols[ci + 1].id });
                                    } else if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const ni = idx + 1;
                                      if (ni < roster.length) setEditing({ studentId: roster[ni].id, columnId: col.id });
                                      else setEditing(null);
                                    } else {
                                      setEditing(null);
                                    }
                                  } else if (e.key === 'Escape') {
                                    setEditing(null);
                                  }
                                }}
                                className="w-14 h-8 text-center rounded-md border-2 border-amber-400 text-[13px] font-mono font-semibold focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => !isFinalized && setEditing({ studentId: student.id, columnId: col.id })}
                                className={`w-14 h-8 rounded-md text-[13px] font-mono font-semibold tx ${
                                  isFinalized       ? 'bg-slate-50 text-navy cursor-default' :
                                  v === null        ? 'text-muted-light bg-slate-50 hover:bg-slate-100' :
                                  isDirty           ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                                                      'bg-white text-navy hover:bg-surface border border-transparent hover:border-line'
                                }`}
                              >
                                {v === null ? '–' : v}
                              </button>
                            )}
                          </td>
                        );
                      })}
                      {!compCols.length && <td />}
                      <td className="px-3 py-2 text-center font-mono text-[13px] text-navy font-semibold">
                        {compAvg !== null ? compAvg.toFixed(1) : '–'}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-[13px] text-muted">
                        {compW !== null ? compW.toFixed(2) : '–'}
                      </td>
                      <td className="px-3 py-2 text-center sticky right-0 bg-white">
                        {grade ? (
                          <span
                            className="inline-flex items-center justify-center w-14 h-8 rounded-md font-mono text-[13px] font-bold"
                            style={{ background: gColor.bg, color: gColor.fg }}
                          >
                            {grade.transmutedGrade}
                          </span>
                        ) : (
                          <span className="text-muted-light">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer stats */}
              <tfoot>
                <tr className="bg-surface text-muted">
                  <td colSpan={2} className="px-3 py-2.5 font-semibold text-navy">Class summary</td>
                  <td colSpan={compCols.length || 1} className="px-3 py-2 text-center text-[11px] text-muted">
                    Avg of all entries
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-semibold text-navy text-[13px]">
                    {classAvg.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center text-[11px] text-muted">
                    High <span className="font-mono text-navy font-semibold">{highScore}</span>{' '}
                    · Low <span className="font-mono text-navy font-semibold">{lowScore}</span>
                  </td>
                  <td className="px-3 py-2 text-center sticky right-0 bg-surface">
                    <span className="text-[11px] text-muted">% passing</span>
                    <div className="text-[14px] font-semibold text-navy font-mono">{passingPct.toFixed(0)}%</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Footnote */}
      <div className="text-[12px] text-muted flex items-center gap-2 px-1">
        <Icon name="info" size={13} />
        Quarterly Grade = WW({Math.round(weights.ww * 100)}%) + PT({Math.round(weights.pt * 100)}%) + QA({Math.round(weights.qa * 100)}%), transmuted per DepEd table. Passing ≥ 75.
        {isFinalized && <span className="ml-2 text-amber-700 font-semibold flex items-center gap-1"><Icon name="lock" size={12} /> Quarter finalized - cells locked</span>}
      </div>

      {/* ── Add column modal ── */}
      <Modal
        open={addColOpen}
        onClose={() => setAddColOpen(false)}
        title="Add score column"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAddColOpen(false)}>Cancel</Btn>
            <Btn variant="primary" icon="plus" onClick={handleAddColumn}>Add column</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Component" required>
            <Select
              value={addColForm.component}
              onChange={(e) => setAddColForm((f) => ({ ...f, component: e.target.value }))}
            >
              <option value="WW">Written Works</option>
              <option value="PT">Performance Tasks</option>
              <option value="QA">Quarterly Assessment</option>
            </Select>
          </Field>
          <Field label="Column label" required>
            <TextInput
              value={addColForm.columnLabel}
              onChange={(e) => setAddColForm((f) => ({ ...f, columnLabel: e.target.value.toUpperCase() }))}
              placeholder="e.g. WW5"
            />
          </Field>
          <Field label="Maximum score" required>
            <TextInput
              type="number"
              value={addColForm.maxScore}
              onChange={(e) => setAddColForm((f) => ({ ...f, maxScore: parseInt(e.target.value) || 100 }))}
            />
          </Field>
        </div>
        <div className="mt-4 p-3 rounded-md bg-primary-light/40 text-[12.5px] text-primary-dark flex items-center gap-2">
          <Icon name="info" size={14} /> Scores auto-save after 1.8s and contribute to the weighted average instantly.
        </div>
      </Modal>

      {/* ── Confirm finalize modal ── */}
      <Modal
        open={confirmFinalizeOpen}
        onClose={() => setConfirmFinalizeOpen(false)}
        title="Finalize quarter?"
        subtitle="This locks all grade entries. Requires school admin to undo."
        footer={
          <>
            <Btn variant="ghost" onClick={() => setConfirmFinalizeOpen(false)}>Cancel</Btn>
            <Btn
              variant="primary"
              icon="lock"
              onClick={handleFinalize}
              disabled={finalizeGrades.isPending}
            >
              {finalizeGrades.isPending ? 'Finalizing…' : 'Yes, finalize'}
            </Btn>
          </>
        }
      >
        <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-[13px] text-amber-800 flex items-start gap-2">
          <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0" />
          <span>
            All {roster.length} students' grades for <strong>{activeQuarter}</strong> will be locked.
            Make sure you have computed grades first via "Compute grades".
          </span>
        </div>
      </Modal>

      {/* ── Class report modal ── */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Class report"
        subtitle={classLoad ? `${classLoad.subject.name} · ${activeQuarter}` : activeQuarter}
      >
        {!classReport ? (
          <div className="py-6 text-center text-[13px] text-muted">
            Run "Compute grades" first to generate the class report.
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-md bg-surface p-3 text-center">
                <div className="text-[11px] text-muted">Class average</div>
                <div className="text-[22px] font-semibold text-navy font-mono">{classReport.stats.classAvg}</div>
              </div>
              <div className="rounded-md bg-surface p-3 text-center">
                <div className="text-[11px] text-muted">Passing</div>
                <div className="text-[22px] font-semibold text-navy font-mono">{classReport.stats.passingPct}%</div>
              </div>
              <div className="rounded-md bg-surface p-3 text-center">
                <div className="text-[11px] text-muted">With honors</div>
                <div className="text-[22px] font-semibold text-navy font-mono">
                  {classReport.stats.withHonors + classReport.stats.withHighHonors + classReport.stats.withHighestHonors}
                </div>
              </div>
            </div>

            {/* Ranking table */}
            <div className="max-h-80 overflow-y-auto border border-line rounded-md">
              <table className="w-full text-[12.5px]">
                <thead className="bg-surface sticky top-0">
                  <tr className="text-left text-muted">
                    <th className="px-3 py-2 font-semibold">Rank</th>
                    <th className="px-3 py-2 font-semibold">Student</th>
                    <th className="px-3 py-2 font-semibold text-right">Grade</th>
                    <th className="px-3 py-2 font-semibold">Honor</th>
                  </tr>
                </thead>
                <tbody>
                  {classReport.rows.map((row) => {
                    const gC = gradeColor(row.transmutedGrade);
                    return (
                      <tr key={row.student.id} className="border-t border-line/70">
                        <td className="px-3 py-2 font-mono font-semibold text-muted">#{row.rank}</td>
                        <td className="px-3 py-2 text-navy">
                          {row.student.lastName}, {row.student.firstName}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className="inline-flex items-center justify-center w-10 h-7 rounded font-mono text-[13px] font-bold"
                            style={{ background: gC.bg, color: gC.fg }}
                          >
                            {row.transmutedGrade}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted">
                          {row.classification === 'withHighestHonors' ? '🏆 With Highest Honors' :
                           row.classification === 'withHighHonors'    ? '⭐ With High Honors'    :
                           row.classification === 'withHonors'        ? '✦ With Honors'          : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
