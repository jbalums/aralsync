import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  Avatar, Card, Icon, Skeleton, StatCard, SectionHeader, Btn, Tabs, EmptyState, useToast,
} from '../../../components';
import { useStudent, useStudentAttendanceSummary, useStudentAttendanceRecords } from '../useStudents';
import { useClassLoads } from '../../classrooms/useClassLoads';
import { quarterlyGradesService } from '../../gradebook/quarterlyGrades.service';
import { GRADE_KEYS } from '../../gradebook/useGradebook';
import { PASSING_GRADE } from '../../../shared/constants/grading';
import { EditStudentModal } from './EditStudentModal';
import { DeleteStudentModal } from './DeleteStudentModal';
import type { AttendanceStatus, Quarter, Session } from '../../../shared/types';

interface StudentProfileContentProps {
  studentId:       string;
  onNavigateBack?: () => void;
  onClose?:        () => void;
}

export function StudentProfileContent({ studentId, onNavigateBack, onClose }: StudentProfileContentProps) {
  const toast = useToast() as { push: (t: { type: string; title: string; message?: string }) => void } | null;
  const [tab, setTab]           = useState('overview');
  const [editOpen, setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [attPage, setAttPage]       = useState(1);
  const [attStatus, setAttStatus]   = useState<AttendanceStatus | ''>('');
  const [attSession, setAttSession] = useState<Session | ''>('');
  const [activeQuarter, setActiveQuarter] = useState<Quarter>('Q1');

  const { data: student, isLoading } = useStudent(studentId);
  const { data: summary }            = useStudentAttendanceSummary(studentId);

  const { data: attRecordsData, isLoading: attLoading } = useStudentAttendanceRecords(studentId, {
    page:    attPage,
    limit:   20,
    status:  attStatus  || undefined,
    session: attSession || undefined,
  });

  const { data: allClassLoads } = useClassLoads();
  const studentClassLoads = allClassLoads?.filter((cl) => cl.sectionId === student?.sectionId) ?? [];

  const gradeQueries = useQueries({
    queries: studentClassLoads.map((cl) => ({
      queryKey: GRADE_KEYS.quarterly(cl.id, activeQuarter),
      queryFn:  () => quarterlyGradesService.get(cl.id, activeQuarter),
      enabled:  Boolean(cl.id),
    })),
  });

  const dismiss = onClose ?? onNavigateBack;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Card className="p-6 space-y-3">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Student not found"
        description="This student does not exist or you don't have access."
        action={undefined}
      />
    );
  }

  const fullName = `${student.firstName}${student.middleName ? ` ${student.middleName.slice(0, 1)}.` : ''} ${student.lastName}`;

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="text-[12px] text-muted hover:text-navy inline-flex items-center gap-1 mb-3"
          >
            <Icon name="arrow-left" size={12} /> Back to Students
          </button>
        )}
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar name={fullName} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-[24px] font-semibold tracking-tight text-navy">
              {student.lastName}, {student.firstName}
              {student.middleName ? ` ${student.middleName.slice(0, 1)}.` : ''}
            </h2>
            <div className="text-[13px] text-muted mt-0.5">
              LRN <span className="font-mono">{student.lrn}</span>{' '}
              · {student.gender === 'M' ? 'Male' : 'Female'}
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {summary && (
                <span className={`pill ${
                  summary.rate >= 85 ? 'bg-emerald-50 text-emerald-700'
                  : summary.rate >= 75 ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
                }`}>
                  <Icon name="check-circle" size={11} />
                  {summary.rate}% attendance
                </span>
              )}
              {student.birthday && (
                <span className="pill bg-slate-100 text-slate-700">
                  <Icon name="calendar" size={11} />
                  Born {student.birthday}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="pencil" onClick={() => setEditOpen(true)}>Edit</Btn>
            <Btn variant="danger"    size="sm" icon="trash-2" onClick={() => setDeleteOpen(true)}>Delete</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'overview',    label: 'Overview',    icon: 'layout-dashboard' },
          { id: 'attendance',  label: 'Attendance',  icon: 'clipboard-check'  },
          { id: 'grades',      label: 'Grades',      icon: 'graduation-cap'   },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-5">
          {summary ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon="check-circle" label="Attendance rate" value={`${summary.rate}%`}  color="accent"  sub={`${summary.total} sessions`} />
              <StatCard icon="check"        label="Present"         value={summary.present}       color="primary" sub="sessions" />
              <StatCard icon="clock"        label="Late"            value={summary.late}          color="amber"   sub="sessions" />
              <StatCard icon="user-x"       label="Absent"          value={summary.absent}        color="rose"    sub="sessions" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
          )}

          {studentClassLoads.length > 0 && (
            <Card className="p-5">
              <SectionHeader title="Student Info" />
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                <div>
                  <dt className="text-muted">LRN</dt>
                  <dd className="font-mono font-medium text-navy mt-0.5">{student.lrn}</dd>
                </div>
                <div>
                  <dt className="text-muted">Gender</dt>
                  <dd className="font-medium text-navy mt-0.5">{student.gender === 'M' ? 'Male' : 'Female'}</dd>
                </div>
                <div>
                  <dt className="text-muted">Section</dt>
                  <dd className="font-medium text-navy mt-0.5">{studentClassLoads[0].section.name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Grade Level</dt>
                  <dd className="font-medium text-navy mt-0.5">Grade {studentClassLoads[0].section.gradeLevel}</dd>
                </div>
                {student.birthday && (
                  <div>
                    <dt className="text-muted">Birthday</dt>
                    <dd className="font-medium text-navy mt-0.5">{student.birthday}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">Subjects</dt>
                  <dd className="font-medium text-navy mt-0.5">{studentClassLoads.length}</dd>
                </div>
              </dl>
            </Card>
          )}

          {student.guardian?.name && (
            <Card className="p-5">
              <SectionHeader title="Guardian" />
              <div className="flex items-center gap-3 mt-3">
                <Avatar name={student.guardian.name} size="lg" />
                <div>
                  <div className="text-[14px] font-semibold text-navy">{student.guardian.name}</div>
                  {student.guardian.relationship && (
                    <div className="text-[12px] text-muted">{student.guardian.relationship}</div>
                  )}
                  {student.guardian.contactNumber && (
                    <div className="text-[12.5px] text-navy mt-1 flex items-center gap-2">
                      <Icon name="phone" size={13} className="text-muted" />
                      {student.guardian.contactNumber}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={attStatus}
                onChange={(e) => { setAttStatus(e.target.value as AttendanceStatus | ''); setAttPage(1); }}
                className="text-[13px] border border-border rounded-lg px-3 py-1.5 bg-background text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
              <select
                value={attSession}
                onChange={(e) => { setAttSession(e.target.value as Session | ''); setAttPage(1); }}
                className="text-[13px] border border-border rounded-lg px-3 py-1.5 bg-background text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All sessions</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
              {attRecordsData && (
                <span className="ml-auto text-[12px] text-muted">
                  {attRecordsData.meta.total} record{attRecordsData.meta.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            {attLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : !attRecordsData || attRecordsData.records.length === 0 ? (
              <div className="p-10 text-center">
                <Icon name="clipboard-check" size={28} className="text-muted mx-auto mb-2" />
                <p className="text-[13px] text-muted">No attendance records found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/5">
                        <th className="text-left px-4 py-2.5 font-medium text-muted">Date</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted">Day</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted">Session</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted">Subject</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted">Quarter</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attRecordsData.records.map((rec) => {
                        const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        const [y, m, d] = rec.date.split('-').map(Number);
                        const dateObj   = new Date(y, m - 1, d);
                        const dateLabel = `${months[m - 1]} ${d}, ${y}`;
                        const dayLabel  = days[dateObj.getDay()];
                        const statusColors: Record<string, string> = {
                          present: 'bg-emerald-50 text-emerald-700',
                          late:    'bg-amber-50 text-amber-700',
                          absent:  'bg-rose-50 text-rose-700',
                          excused: 'bg-slate-100 text-slate-600',
                        };
                        return (
                          <tr key={rec.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                            <td className="px-4 py-2.5 text-navy font-medium">{dateLabel}</td>
                            <td className="px-4 py-2.5 text-muted">{dayLabel}</td>
                            <td className="px-4 py-2.5">
                              <span className={`pill text-[11px] ${rec.session === 'AM' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                {rec.session}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-navy">
                              {rec.subjectName || <span className="text-muted">—</span>}
                            </td>
                            <td className="px-4 py-2.5 text-muted">{rec.quarter}</td>
                            <td className="px-4 py-2.5">
                              <span className={`pill text-[11px] capitalize ${statusColors[rec.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {attRecordsData.meta.pages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[12px] text-muted">
                    <Btn variant="secondary" size="sm" onClick={() => setAttPage((p) => Math.max(1, p - 1))} disabled={attPage <= 1}>
                      ← Prev
                    </Btn>
                    <span>Page {attRecordsData.meta.page} of {attRecordsData.meta.pages}</span>
                    <Btn variant="secondary" size="sm" onClick={() => setAttPage((p) => Math.min(attRecordsData.meta.pages, p + 1))} disabled={attPage >= attRecordsData.meta.pages}>
                      Next →
                    </Btn>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {tab === 'grades' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((q) => (
              <button
                key={q}
                onClick={() => setActiveQuarter(q)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeQuarter === q ? 'bg-primary text-white' : 'bg-muted/10 text-muted hover:bg-muted/20'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            {gradeQueries.some((q) => q.isLoading) ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : studentClassLoads.length === 0 ? (
              <div className="p-10 text-center">
                <Icon name="graduation-cap" size={28} className="text-muted mx-auto mb-2" />
                <p className="text-[13px] text-muted">No class loads found for this student.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/5">
                      <th className="text-left  px-4 py-2.5 font-medium text-muted">Subject</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted">WW</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted">PT</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted">QA</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted">Initial</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted">Final Grade</th>
                      <th className="text-center px-4 py-2.5 font-medium text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentClassLoads.map((cl, i) => {
                      const gradeRow = gradeQueries[i]?.data?.find((r) => r.studentId === student.id);
                      const hasGrade = Boolean(gradeRow);
                      const passing  = hasGrade && gradeRow!.transmutedGrade >= PASSING_GRADE;
                      return (
                        <tr key={cl.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                          <td className="px-4 py-2.5 text-navy font-medium">{cl.subject.name}</td>
                          <td className="px-4 py-2.5 text-right text-muted">{hasGrade ? `${gradeRow!.wwWeighted.toFixed(1)}%` : '—'}</td>
                          <td className="px-4 py-2.5 text-right text-muted">{hasGrade ? `${gradeRow!.ptWeighted.toFixed(1)}%` : '—'}</td>
                          <td className="px-4 py-2.5 text-right text-muted">{hasGrade ? `${gradeRow!.qaWeighted.toFixed(1)}%` : '—'}</td>
                          <td className="px-4 py-2.5 text-right text-muted">{hasGrade ? gradeRow!.initialGrade.toFixed(1) : '—'}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-navy">{hasGrade ? gradeRow!.transmutedGrade : '—'}</td>
                          <td className="px-4 py-2.5 text-center">
                            {hasGrade ? (
                              <span className={`pill text-[11px] ${passing ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {passing ? 'Pass' : 'Fail'}
                              </span>
                            ) : (
                              <span className="pill text-[11px] bg-slate-100 text-slate-500">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {(() => {
                    const graded = studentClassLoads
                      .map((cl, i) => gradeQueries[i]?.data?.find((r) => r.studentId === student.id))
                      .filter(Boolean);
                    if (graded.length === 0) return null;
                    const avg = graded.reduce((sum, r) => sum + r!.transmutedGrade, 0) / graded.length;
                    return (
                      <tfoot>
                        <tr className="bg-muted/5 border-t border-border font-semibold">
                          <td className="px-4 py-2.5 text-navy" colSpan={5}>
                            Average ({graded.length} subject{graded.length !== 1 ? 's' : ''})
                          </td>
                          <td className="px-4 py-2.5 text-right text-navy">{avg.toFixed(1)}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`pill text-[11px] ${avg >= PASSING_GRADE ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {avg >= PASSING_GRADE ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    );
                  })()}
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      <EditStudentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={student}
        onSuccess={() => toast?.push({ type: 'success', title: 'Student updated', message: 'Changes saved.' })}
      />
      <DeleteStudentModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        student={student}
        onSuccess={() => {
          toast?.push({ type: 'success', title: 'Student deleted' });
          dismiss?.();
        }}
      />
    </div>
  );
}
