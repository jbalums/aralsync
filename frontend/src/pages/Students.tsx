import React, { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Icon, Avatar, Card, EmptyState, Skeleton, Btn, Select, useToast } from '../components';
import { useStudents } from '../modules/students/useStudents';
import { useClassLoads } from '../modules/classrooms/useClassLoads';
import { AddStudentModal }       from '../modules/students/components/AddStudentModal';
import { ImportCSVModal }        from '../modules/students/components/ImportCSVModal';
import { StudentProfileModal }   from '../modules/students/components/StudentProfileModal';
import { StudentProfileContent } from '../modules/students/components/StudentProfileContent';

type Toast = { push: (t: { type: string; title: string; message?: string }) => void };

export function PageStudents() {
  const toast = useToast() as Toast | null;

  const [q, setQ]               = useState('');
  const [classLoadId, setClassLoadId] = useState('');
  const [page, setPage]         = useState(1);
  const [addOpen, setAddOpen]   = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [profileId, setProfileId]   = useState<string | null>(null);

  const { data, isLoading } = useStudents({
    q:           q           || undefined,
    classLoadId: classLoadId || undefined,
    page,
    limit: 50,
  });
  const students = data?.students ?? [];
  const total    = data?.total    ?? 0;
  const pages    = data?.pages    ?? 1;

  const { data: classLoads = [] } = useClassLoads();

  return (
    <div className="page-anim space-y-5">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by name or LRN…"
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
            />
          </div>
          <Select
            value={classLoadId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setClassLoadId(e.target.value); setPage(1); }}
            className="!h-9 max-w-[240px]"
          >
            <option value="">All classes</option>
            {classLoads.map((c) => (
              <option key={c.id} value={c.id}>
                {c.section.gradeLevel} · {c.section.name} · {c.subject.name}
              </option>
            ))}
          </Select>
          <span className="ml-auto" />
          <Btn variant="secondary" size="sm" icon="upload"    onClick={() => setImportOpen(true)}>Import CSV</Btn>
          <Btn variant="primary"   size="sm" icon="user-plus" onClick={() => setAddOpen(true)}>Add student</Btn>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon="users"
              title="No students found"
              description={q ? 'Try a different search.' : 'Add or import students to get started.'}
              action={undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold w-10">#</th>
                  <th className="px-3 py-2.5 font-semibold">Student</th>
                  <th className="px-3 py-2.5 font-semibold">LRN</th>
                  <th className="px-3 py-2.5 font-semibold">Gender</th>
                  <th className="px-3 py-2.5 font-semibold w-10" />
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-t border-line hover:bg-slate-50/40 cursor-pointer"
                    onClick={() => setProfileId(s.id)}
                  >
                    <td className="px-3 py-2 font-mono text-muted">{(page - 1) * 50 + i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                        <span className="font-semibold text-navy">
                          {s.lastName}, {s.firstName}
                          {s.middleName ? ` ${s.middleName.slice(0, 1)}.` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted">{s.lrn}</td>
                    <td className="px-3 py-2 text-muted">{s.gender === 'M' ? 'Male' : 'Female'}</td>
                    <td className="px-3 py-2 text-right">
                      <Icon name="chevron-right" size={14} className="text-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-line flex items-center justify-between text-[12px] text-muted">
          <span>Showing {students.length} of {total}</span>
          <div className="flex items-center gap-1">
            <Btn size="sm" variant="ghost" icon="chevron-left" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Prev
            </Btn>
            <span className="px-2 font-mono">{page} / {pages}</span>
            <Btn size="sm" variant="ghost" iconRight="chevron-right" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>
              Next
            </Btn>
          </div>
        </div>
      </Card>

      <AddStudentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        classLoads={classLoads}
        onSuccess={() => toast?.push({ type: 'success', title: 'Student added', message: 'Queued for sync.' })}
      />
      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        classLoads={classLoads}
        onSuccess={(r) =>
          toast?.push({
            type:    'success',
            title:   'Import complete',
            message: `Created ${r.created}, updated ${r.updated}${r.failed.length ? `, ${r.failed.length} failed` : ''}.`,
          })
        }
      />
      <StudentProfileModal
        studentId={profileId ?? ''}
        open={Boolean(profileId)}
        onClose={() => setProfileId(null)}
      />
    </div>
  );
}

export function PageStudentProfile() {
  const navigate    = useNavigate();
  const { studentId } = useParams({ strict: false }) as { studentId: string };
  return (
    <div className="page-anim">
      <StudentProfileContent
        studentId={studentId}
        onNavigateBack={() => void navigate({ to: '/app/students' })}
      />
    </div>
  );
}
