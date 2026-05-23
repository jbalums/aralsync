// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Icon, Card, Modal, useToast, Btn, Badge, Select, Field, TextInput,
} from '../components';
import { useClassLoads, useClassLoadStudents } from '../modules/classrooms/useClassLoads';
import { reportsService } from '../modules/reports/reports.service';
import { generateSf2Pdf, generateSf2Excel } from '../modules/reports/sf2';
import { generateSf9Pdf } from '../modules/reports/sf9';
import { generateSf10Pdf } from '../modules/reports/sf10';
import * as XLSX from 'xlsx';
import { useClassReport } from '../modules/gradebook/useGradebook';

// ── Quarter type ──────────────────────────────────────────────────────────────
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

// ── Month list ────────────────────────────────────────────────────────────────
const MONTHS = [
  { label:'January',   value:'01' }, { label:'February',  value:'02' },
  { label:'March',     value:'03' }, { label:'April',      value:'04' },
  { label:'May',       value:'05' }, { label:'June',       value:'06' },
  { label:'July',      value:'07' }, { label:'August',     value:'08' },
  { label:'September', value:'09' }, { label:'October',    value:'10' },
  { label:'November',  value:'11' }, { label:'December',   value:'12' },
];

// ── Tone map ──────────────────────────────────────────────────────────────────
const TONE: Record<string,{ bg: string; fg: string }> = {
  primary: { bg:'#CCFBF1', fg:'#0F766E' },
  accent:  { bg:'#D1FAE5', fg:'#047857' },
  blue:    { bg:'#DBEAFE', fg:'#1D4ED8' },
  amber:   { bg:'#FEF3C7', fg:'#92400E' },
  rose:    { bg:'#FFE4E6', fg:'#9F1239' },
  purple:  { bg:'#EDE9FE', fg:'#6D28D9' },
  muted:   { bg:'#F1F5F9', fg:'#475569' },
};

// ── Honor classification label ────────────────────────────────────────────────
function classifyLabel(c: string | null): string {
  if (c === 'withHighestHonors') return 'With Highest Honors';
  if (c === 'withHighHonors')    return 'With High Honors';
  if (c === 'withHonors')        return 'With Honors';
  return '-';
}

// ── main ──────────────────────────────────────────────────────────────────────
export function PageReports() {
  const toast = useToast();

  const { data: classLoads = [] } = useClassLoads();

  const [selectedClassLoadId, setSelectedClassLoadId] = useState<string>('');
  const [selectedQuarter,     setSelectedQuarter]     = useState<Quarter>('Q1');
  const [selectedMonth,       setSelectedMonth]       = useState<string>('01');
  const [selectedStudentId,   setSelectedStudentId]   = useState<string>('');
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>('');

  const selectedLoad = classLoads.find(c => c.id === selectedClassLoadId);

  // Students for the selected class load (for SF9/SF10 selector)
  const { data: students = [] } = useClassLoadStudents(selectedClassLoadId);

  // School years (for SF9/SF10 selector) - derived from class loads
  const schoolYearOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const cl of classLoads) {
      if (cl.schoolYearId && cl.schoolYearLabel) {
        seen.set(cl.schoolYearId, cl.schoolYearLabel);
      }
    }
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [classLoads]);

  // Class report data for at-risk + honor roll
  const { data: classReport } = useClassReport(selectedClassLoadId, selectedQuarter);

  const atRiskStudents = useMemo(() =>
    (classReport?.rows ?? []).filter(r => r.transmutedGrade < 75),
  [classReport]);

  const honorRollStudents = useMemo(() =>
    (classReport?.rows ?? []).filter(r => r.transmutedGrade >= 90).map(r => ({
      ...r,
      honorLabel: classifyLabel(r.classification),
    })),
  [classReport]);

  // ── generators ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const setL = (id: string, v: boolean) => setLoading(prev => ({ ...prev, [id]: v }));

  async function handleSf2(format: 'pdf' | 'excel') {
    if (!selectedClassLoadId) { toast.push({ type:'warning', message:'Select a class load first.' }); return; }
    const key = `sf2-${format}`;
    setL(key, true);
    try {
      const month = `${new Date().getFullYear()}-${selectedMonth}`;
      const data = await reportsService.getSf2Sheet(selectedClassLoadId, month);
      if (format === 'pdf')   generateSf2Pdf(data);
      else                    generateSf2Excel(data);
      toast.push({ type:'success', title:'SF2 ready', message:`Downloaded as ${format.toUpperCase()}` });
    } catch {
      toast.push({ type:'error', message:'Failed to generate SF2. Check API connection.' });
    } finally { setL(key, false); }
  }

  async function handleSf9() {
    if (!selectedStudentId || !selectedSchoolYearId) {
      toast.push({ type:'warning', message:'Select a student and school year.' });
      return;
    }
    setL('sf9', true);
    try {
      const data = await reportsService.getReportCard(selectedStudentId, selectedSchoolYearId);
      generateSf9Pdf(data);
      toast.push({ type:'success', title:'SF9 ready', message:'Report card downloaded.' });
    } catch {
      toast.push({ type:'error', message:'Failed to generate SF9.' });
    } finally { setL('sf9', false); }
  }

  async function handleSf10() {
    if (!selectedStudentId || !selectedSchoolYearId) {
      toast.push({ type:'warning', message:'Select a student and school year.' });
      return;
    }
    setL('sf10', true);
    try {
      const data = await reportsService.getReportCard(selectedStudentId, selectedSchoolYearId);
      generateSf10Pdf(data);
      toast.push({ type:'success', title:'SF10 ready', message:'Permanent record downloaded.' });
    } catch {
      toast.push({ type:'error', message:'Failed to generate SF10.' });
    } finally { setL('sf10', false); }
  }

  function handleClassGradeSummaryExcel() {
    if (!classReport || !classReport.rows.length) {
      toast.push({ type:'warning', message:'Compute grades first to get class report data.' });
      return;
    }
    const header = ['Rank', 'Last Name', 'First Name', 'LRN', 'WW Weighted', 'PT Weighted', 'QA Weighted', 'Initial Grade', 'Transmuted Grade', 'Classification'];
    const rows = classReport.rows.map(r => [
      r.rank,
      r.student.lastName,
      r.student.firstName,
      r.student.lrn,
      r.wwWeighted,
      r.ptWeighted,
      r.qaWeighted,
      r.initialGrade,
      r.transmutedGrade,
      classifyLabel(r.classification),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Class Grades');
    XLSX.writeFile(wb, `ClassGrades_${selectedLoad?.subject?.name ?? 'export'}_${selectedQuarter}.xlsx`);
    toast.push({ type:'success', message:'Class grade summary downloaded.' });
  }

  function handleAtRiskPdf() {
    if (!atRiskStudents.length) { toast.push({ type:'info', message:'No at-risk students.' }); return; }
    // Simple jsPDF-free approach: open a print-friendly window
    const rows = atRiskStudents.map((r, i) =>
      `<tr><td>${i+1}</td><td>${r.student.lastName}, ${r.student.firstName}</td><td>${r.student.lrn}</td><td>${r.transmutedGrade}</td></tr>`
    ).join('');
    const html = `<html><head><title>At-Risk Students</title><style>body{font-family:Arial;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}</style></head><body><h2>At-Risk Students Report</h2><p>${selectedLoad?.subject?.name ?? ''} · ${selectedQuarter}</p><table><tr><th>#</th><th>Name</th><th>LRN</th><th>Grade</th></tr>${rows}</table></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  }

  function handleHonorRollPdf() {
    if (!honorRollStudents.length) { toast.push({ type:'info', message:'No honor roll students.' }); return; }
    const rows = honorRollStudents.map((r, i) =>
      `<tr><td>${r.rank}</td><td>${r.student.lastName}, ${r.student.firstName}</td><td>${r.student.lrn}</td><td>${r.transmutedGrade}</td><td>${r.honorLabel}</td></tr>`
    ).join('');
    const html = `<html><head><title>Honor Roll</title><style>body{font-family:Arial;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}</style></head><body><h2>Honor Roll</h2><p>${selectedLoad?.subject?.name ?? ''} · ${selectedQuarter}</p><table><tr><th>Rank</th><th>Name</th><th>LRN</th><th>Grade</th><th>Classification</th></tr>${rows}</table></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  }

  // ── report card ─────────────────────────────────────────────────────────────
  const REPORTS = [
    {
      id: 'sf2', code: 'SF2', title: 'Daily Attendance Record',
      desc: 'Official DepEd monthly attendance form. Captures daily check-ins and totals.',
      icon: 'clipboard-list', tone: 'primary',
      note: 'Select a class load and month before generating.',
    },
    {
      id: 'sf9', code: 'SF9', title: 'Report Card',
      desc: 'Per-student quarterly grades across all subjects, ready for parent distribution.',
      icon: 'file-text', tone: 'accent',
      note: 'Select a student and school year.',
    },
    {
      id: 'gs', code: '', title: 'Class Grade Summary',
      desc: 'All students · all components (WW · PT · QA) with final quarterly grades.',
      icon: 'graduation-cap', tone: 'blue',
    },
    {
      id: 'risk', code: '', title: 'At-Risk Students Report',
      desc: 'Auto-filtered: grade below 75. Includes student names and LRNs.',
      icon: 'alert-triangle', tone: 'amber',
    },
    {
      id: 'honor', code: '', title: 'Honor Roll List',
      desc: 'Auto-generated honor tiers: With Highest / High / With Honors.',
      icon: 'award', tone: 'rose',
    },
    {
      id: 'sf10', code: 'SF10', title: "Learner's Permanent Record",
      desc: 'Cumulative academic history per learner. Use end of year only.',
      icon: 'archive', tone: 'muted',
      note: 'Select a student and school year.',
    },
  ] as const;

  return (
    <div className="page-anim space-y-5">
      {/* Header + filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-navy">Reports & exports</h2>
            <p className="text-[13px] text-muted mt-1">
              Generate official DepEd forms or quick exports. Files build locally in-browser.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Class load">
            <Select
              value={selectedClassLoadId}
              onChange={e => setSelectedClassLoadId(e.target.value)}
            >
              <option value="">All classes</option>
              {classLoads.map(c => (
                <option key={c.id} value={c.id}>
                  {c.subject?.name ?? c.subjectName} · {c.section?.name ?? c.sectionName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Quarter">
            <Select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value as Quarter)}>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </Select>
          </Field>
          <Field label="Month (for SF2)">
            <Select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
          </Field>
          <Field label="Student (for SF9/SF10)">
            <Select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              disabled={!selectedClassLoadId}
            >
              <option value="">Select student…</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.lastName}, {s.firstName}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {schoolYearOptions.length > 0 && (
          <div className="mt-3 max-w-xs">
            <Field label="School year (for SF9/SF10)">
              <Select
                value={selectedSchoolYearId}
                onChange={e => setSelectedSchoolYearId(e.target.value)}
              >
                <option value="">Select school year…</option>
                {schoolYearOptions.map(sy => (
                  <option key={sy.id} value={sy.id}>{sy.label}</option>
                ))}
              </Select>
            </Field>
          </div>
        )}

        {/* Stats from class report */}
        {classReport && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md border border-line bg-surface p-3 text-center">
              <div className="text-[10px] uppercase text-muted font-semibold">Class Avg</div>
              <div className="text-[22px] font-bold text-navy font-mono">{classReport.stats.classAvg.toFixed(1)}</div>
            </div>
            <div className="rounded-md border border-line bg-surface p-3 text-center">
              <div className="text-[10px] uppercase text-muted font-semibold">Passing</div>
              <div className="text-[22px] font-bold text-green-700 font-mono">{classReport.stats.passingPct}%</div>
            </div>
            <div className="rounded-md border border-line bg-surface p-3 text-center">
              <div className="text-[10px] uppercase text-muted font-semibold">At Risk</div>
              <div className="text-[22px] font-bold text-rose-600 font-mono">{atRiskStudents.length}</div>
            </div>
            <div className="rounded-md border border-line bg-surface p-3 text-center">
              <div className="text-[10px] uppercase text-muted font-semibold">Honor Roll</div>
              <div className="text-[22px] font-bold text-amber-600 font-mono">{honorRollStudents.length}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(r => {
          const t = TONE[r.tone] ?? TONE.muted;
          return (
            <Card key={r.id} className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span
                  className="w-11 h-11 rounded-md inline-flex items-center justify-center shrink-0"
                  style={{ background: t.bg, color: t.fg }}
                >
                  <Icon name={r.icon} size={20}/>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-navy">{r.title}</h3>
                    {r.code && <Badge status="primary">{r.code}</Badge>}
                  </div>
                  <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{r.desc}</p>
                  {r.note && (
                    <p className="text-[11.5px] text-amber-700 mt-2 inline-flex items-center gap-1">
                      <Icon name="info" size={11}/>{r.note}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <ReportActions
                      id={r.id}
                      loading={loading}
                      onSf2Pdf={()   => handleSf2('pdf')}
                      onSf2Excel={()  => handleSf2('excel')}
                      onSf9={()       => handleSf9()}
                      onSf10={()      => handleSf10()}
                      onGradeSummary={() => handleClassGradeSummaryExcel()}
                      onAtRisk={()    => handleAtRiskPdf()}
                      onHonorRoll={()  => handleHonorRollPdf()}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Class report preview table */}
      {classReport && classReport.rows.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-navy">
              Class report · {selectedLoad?.subject?.name ?? '-'} · {selectedQuarter}
            </h3>
            <span className="text-[11px] text-muted">{classReport.rows.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-surface border-b border-line">
                <tr>
                  <th className="px-3 py-2 text-left text-muted font-semibold">Rank</th>
                  <th className="px-3 py-2 text-left text-muted font-semibold">Name</th>
                  <th className="px-3 py-2 text-right text-muted font-semibold">Initial</th>
                  <th className="px-3 py-2 text-right text-muted font-semibold">Grade</th>
                  <th className="px-3 py-2 text-left text-muted font-semibold">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {classReport.rows.map(r => (
                  <tr key={r.student.id} className={r.transmutedGrade < 75 ? 'bg-rose-50' : r.transmutedGrade >= 90 ? 'bg-amber-50' : ''}>
                    <td className="px-3 py-2 font-mono text-muted">{r.rank}</td>
                    <td className="px-3 py-2 font-semibold text-navy">
                      {r.student.lastName}, {r.student.firstName}
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-muted">{r.initialGrade}</td>
                    <td className={`px-3 py-2 font-mono text-right font-bold ${r.transmutedGrade < 75 ? 'text-rose-600' : 'text-navy'}`}>
                      {r.transmutedGrade}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted">
                      {classifyLabel(r.classification)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── per-report action buttons ─────────────────────────────────────────────────
function ReportActions({
  id, loading,
  onSf2Pdf, onSf2Excel, onSf9, onSf10,
  onGradeSummary, onAtRisk, onHonorRoll,
}: {
  id: string;
  loading: Record<string, boolean>;
  onSf2Pdf: () => void; onSf2Excel: () => void;
  onSf9: () => void;    onSf10: () => void;
  onGradeSummary: () => void;
  onAtRisk: () => void; onHonorRoll: () => void;
}) {
  if (id === 'sf2') return (
    <>
      <Btn variant="primary"    size="sm" icon="file-text"        onClick={onSf2Pdf}   disabled={loading['sf2-pdf']}>
        {loading['sf2-pdf'] ? 'Building…' : 'PDF'}
      </Btn>
      <Btn variant="secondary"  size="sm" icon="file-spreadsheet" onClick={onSf2Excel} disabled={loading['sf2-excel']}>
        {loading['sf2-excel'] ? 'Building…' : 'Excel'}
      </Btn>
    </>
  );

  if (id === 'sf9') return (
    <Btn variant="primary" size="sm" icon="download" onClick={onSf9} disabled={loading['sf9']}>
      {loading['sf9'] ? 'Building…' : 'Download PDF'}
    </Btn>
  );

  if (id === 'gs') return (
    <Btn variant="secondary" size="sm" icon="file-spreadsheet" onClick={onGradeSummary}>
      Excel
    </Btn>
  );

  if (id === 'risk') return (
    <Btn variant="secondary" size="sm" icon="printer" onClick={onAtRisk}>
      Print / PDF
    </Btn>
  );

  if (id === 'honor') return (
    <Btn variant="secondary" size="sm" icon="printer" onClick={onHonorRoll}>
      Print / PDF
    </Btn>
  );

  if (id === 'sf10') return (
    <Btn variant="primary" size="sm" icon="download" onClick={onSf10} disabled={loading['sf10']}>
      {loading['sf10'] ? 'Building…' : 'Download PDF'}
    </Btn>
  );

  return null;
}
