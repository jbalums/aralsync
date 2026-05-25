// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Icon, Avatar, Badge, Card, Modal, useToast,
  EmptyState, Skeleton, StatCard, SectionHeader, Btn,
  Dropdown, Tabs, Field, TextInput,
} from '../components';
import { useAuthStore } from '../modules/auth/authStore';
import {
  useSchoolYears,
  useCreateSchoolYear,
  useUpdateSchoolYear,
  useDeleteSchoolYear,
  useActivateSchoolYear,
} from '../modules/classrooms/useSchoolYears';
import { schoolsService } from '../modules/classrooms/schools.service';
import {
  useAdminSummary,
  useAdminFaculty,
  useAdminClasses,
  useAdminAuditLog,
  useUpdateFacultyMember,
  useUpdateFacultyRole,
  useAssignFacultyClass,
  useAdminAssignTeacher,
  useAdminDeleteClass,
} from '../modules/admin/useAdmin';
import { AdminClassModal } from '../components/classes/AdminClassModal';

// ─── helpers ─────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5)  return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

const ROLE_LABEL = {
  school_admin:       'School Administrator',
  advisory_teacher:   'Advisory Teacher',
  subject_teacher:    'Subject Teacher',
  super_admin:        'Super Admin',
};

const ROLE_STATUS = {
  school_admin:       'primary',
  advisory_teacher:   'synced',
  subject_teacher:    'neutral',
  super_admin:        'primary',
};

const DEPT_COLORS = [
  '#0EA5A4','#2563EB','#9333EA','#EA580C','#10B981','#F59E0B','#EF4444','#6366F1',
];

const TONE_MAP = {
  edit:     { bg:'#DBEAFE', fg:'#1D4ED8', icon:'pencil-line' },
  save:     { bg:'#D1FAE5', fg:'#065F46', icon:'save' },
  export:   { bg:'#EDE9FE', fg:'#6D28D9', icon:'download' },
  create:   { bg:'#CCFBF1', fg:'#0F766E', icon:'plus' },
  system:   { bg:'#FEF3C7', fg:'#92400E', icon:'cpu' },
  lock:     { bg:'#F1F5F9', fg:'#475569', icon:'lock' },
  security: { bg:'#FEE2E2', fg:'#7F1D1D', icon:'shield' },
};

const schoolYearSchema = z.object({
  label:     z.string().min(1, 'Label is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate:   z.string().min(1, 'End date is required'),
});

// ─── PAGE ────────────────────────────────────────────────

export function PageAdmin({ setRoute }) {
  const [tab, setTab] = useState('overview');
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId;

  const { data: school }   = useQuery({
    queryKey: ['school', schoolId],
    queryFn:  () => schoolsService.getById(schoolId!),
    enabled:  Boolean(schoolId),
  });
  const { data: years = [] } = useSchoolYears(schoolId);
  const { data: summary }   = useAdminSummary(schoolId);
  const { data: faculty = [], isLoading: facultyLoading }  = useAdminFaculty(schoolId);
  const { data: classes = [], isLoading: classesLoading }  = useAdminClasses(schoolId);
  const { data: log = [],     isLoading: logLoading }      = useAdminAuditLog(schoolId);

  const activeYear = years.find((y) => y.isActive);

  const headerDesc = school
    ? `${school.name} · ${school.division}${activeYear ? ` · ${activeYear.label}` : ''}. School-wide oversight for ${summary?.facultyCount ?? '—'} teachers, ${summary?.sectionCount ?? '—'} sections, ${summary?.studentCount ?? '—'} students.`
    : 'Loading school information…';

  return (
    <div className="page-anim space-y-5">
      {/* Header */}
      <Card className="p-4 sm:p-5 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0D5E57 0%, #0F766E 70%, #10B981 130%)' }}>
        <div className="absolute inset-0 grid-bg opacity-20"/>
        <div className="relative flex items-start justify-between gap-3 flex-wrap text-white">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold tracking-wider uppercase">
              <Icon name="shield-check" size={12}/> School Administrator · Full access
            </div>
            <h2 className="text-[26px] font-semibold tracking-tight mt-2.5">Admin Console</h2>
            <p className="text-[13px] text-white/80 mt-1 max-w-xl">{headerDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="download" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">Export school data</Btn>
            <Btn size="sm" icon="settings" className="!bg-white !text-primary-dark hover:!bg-primary-light" onClick={() => setRoute('settings')}>School settings</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id:'overview',     label:'School Overview', icon:'building-2' },
          { id:'faculty',      label:'Faculty',         icon:'users-round', count: faculty.length || undefined },
          { id:'classes',      label:'All Classes',     icon:'book-marked' },
          { id:'school_years', label:'School Years',    icon:'calendar' },
          { id:'audit',        label:'Audit Log',       icon:'list',        count: log.length || undefined },
          { id:'roles',        label:'Roles & Access',  icon:'key-round' },
        ]}
        active={tab} onChange={setTab}
      />

      {tab === 'overview'     && <AdminOverview summary={summary}/>}
      {tab === 'faculty'      && <AdminFaculty faculty={faculty} isLoading={facultyLoading} schoolId={schoolId}/>}
      {tab === 'classes'      && <AdminClasses classes={classes} isLoading={classesLoading} schoolId={schoolId} faculty={faculty}/>}
      {tab === 'school_years' && <AdminSchoolYears schoolId={schoolId}/>}
      {tab === 'audit'        && <AdminAudit log={log} isLoading={logLoading}/>}
      {tab === 'roles'        && <AdminRoles faculty={faculty}/>}
    </div>
  );
}

// ─── OVERVIEW ────────────────────────────────────────────

function AdminOverview({ summary }) {
  const loading = !summary;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl"/>)
        ) : (
          <>
            <StatCard icon="users-round" label="Faculty"         value={summary.facultyCount}              color="primary" sub="Active teachers"/>
            <StatCard icon="users"       label="Students"        value={summary.studentCount}              color="accent"  sub={`Across ${summary.sectionCount} sections`}/>
            <StatCard icon="check-circle" label="School avg att." value={`${summary.schoolAvgAttendance}%`} color="blue"    sub="Last 30 days"/>
            <StatCard icon="layout-grid" label="Sections"        value={summary.sectionCount}              color="amber"   sub="Active sections"/>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Attendance by department" subtitle="Last 30 days · all sections"/>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-8 rounded"/>)}</div>
          ) : summary.attendanceByDept.length === 0 ? (
            <p className="text-[12.5px] text-muted mt-3">No attendance data yet.</p>
          ) : (
            <div className="space-y-3 mt-2">
              {summary.attendanceByDept.map((row, i) => (
                <div key={row.dept}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1">
                    <span className="font-semibold text-navy">{row.dept}</span>
                    <span className="text-muted">{row.studentCount} students · <span className="font-mono text-navy font-semibold">{row.rate}%</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full" style={{ width:`${row.rate}%`, background: DEPT_COLORS[i % DEPT_COLORS.length] }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionHeader title="School-wide performance" subtitle="Grade bands · all quarterly grades"/>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded"/>)}</div>
          ) : (
            <div className="mt-2 space-y-2">
              {[
                { band:'≥98',   label:'Highest Honors', count: summary.gradeDistribution.highestHonors, color:'#0F766E' },
                { band:'95–97', label:'High Honors',    count: summary.gradeDistribution.highHonors,    color:'#10B981' },
                { band:'90–94', label:'With Honors',    count: summary.gradeDistribution.honors,        color:'#22C55E' },
                { band:'75–89', label:'Passing',        count: summary.gradeDistribution.passing,       color:'#3B82F6' },
                { band:'<75',   label:'Needs help',     count: summary.gradeDistribution.needsHelp,     color:'#EF4444' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{r.label}</div>
                    <div className="text-[10.5px] font-mono mt-0.5 px-1.5 py-0.5 rounded-full inline-block" style={{ background:`${r.color}22`, color:r.color }}>{r.band}</div>
                  </div>
                  <div className="text-[22px] font-bold font-mono text-navy">{r.count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── FACULTY ─────────────────────────────────────────────

const deptEditSchema = z.object({
  department: z.string(),
  position:   z.string(),
});

function AdminFaculty({ faculty, isLoading, schoolId }) {
  const [q, setQ]             = useState('');
  const [editTarget, setEdit] = useState(null);
  const [roleTarget, setRoleTarget]     = useState(null);
  const [roleValue, setRoleValue]       = useState('subject_teacher');
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignQ, setAssignQ]           = useState('');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const toast                 = useToast();
  const updateMutation        = useUpdateFacultyMember(schoolId ?? '');
  const roleMutation          = useUpdateFacultyRole(schoolId ?? '');
  const assignMutation        = useAssignFacultyClass(schoolId ?? '');
  const { data: allClasses = [], isLoading: classesLoading } = useAdminClasses(schoolId);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(deptEditSchema),
  });

  function openEdit(member) {
    reset({ department: member.department ?? '', position: member.position ?? '' });
    setEdit(member);
  }

  function openRole(member) {
    setRoleValue(member.role);
    setRoleTarget(member);
  }

  function openAssign(member) {
    setSelectedClassId(null);
    setAssignQ('');
    setAssignTarget(member);
  }

  async function onDeptSave(values) {
    try {
      await updateMutation.mutateAsync({ userId: editTarget.id, data: values });
      toast?.push({ type: 'success', title: 'Faculty member updated' });
      setEdit(null);
    } catch {
      toast?.push({ type: 'error', title: 'Update failed' });
    }
  }

  async function onRoleSave() {
    if (!roleTarget) return;
    try {
      await roleMutation.mutateAsync({ userId: roleTarget.id, role: roleValue });
      toast?.push({ type: 'success', title: 'Faculty role updated' });
      setRoleTarget(null);
    } catch {
      toast?.push({ type: 'error', title: 'Could not update role' });
    }
  }

  async function onAssignSave() {
    if (!assignTarget || !selectedClassId) return;
    try {
      await assignMutation.mutateAsync({ userId: assignTarget.id, classLoadId: selectedClassId });
      toast?.push({ type: 'success', title: 'Class assigned' });
      setAssignTarget(null);
    } catch {
      toast?.push({ type: 'error', title: 'Could not assign class' });
    }
  }

  const list = faculty.filter((f) =>
    !q || f.name.toLowerCase().includes(q.toLowerCase()) || (f.department ?? '').toLowerCase().includes(q.toLowerCase()),
  );

  const filteredClasses = allClasses.filter((c) => {
    if (!assignQ) return true;
    const needle = assignQ.toLowerCase();
    return (
      c.subject.name.toLowerCase().includes(needle) ||
      c.section.name.toLowerCase().includes(needle) ||
      c.teacher.name.toLowerCase().includes(needle)
    );
  });

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search faculty by name or department…" className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"/>
          </div>
          <span className="ml-auto text-[12px] text-muted">{list.length} members</span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-md"/>)}</div>
        ) : list.length === 0 ? (
          <div className="py-10"><EmptyState icon="users-round" title="No faculty members found" description="No teachers are registered for this school yet."/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Teacher</th>
                  <th className="px-3 py-2.5 font-semibold">Role</th>
                  <th className="px-3 py-2.5 font-semibold">Department</th>
                  <th className="px-3 py-2.5 font-semibold">Classes</th>
                  <th className="px-3 py-2.5 font-semibold">Last active</th>
                  <th className="px-3 py-2.5 font-semibold w-12"/>
                </tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id} className="border-t border-line hover:bg-slate-50/40">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={f.name} size="sm"/>
                        <div>
                          <div className="font-semibold text-navy">{f.name}</div>
                          <div className="text-[10.5px] text-muted">{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge status={ROLE_STATUS[f.role] ?? 'neutral'}>{ROLE_LABEL[f.role] ?? f.role}</Badge>
                    </td>
                    <td className="px-3 py-2 text-navy/80">{f.department || <span className="text-muted italic">Not set</span>}</td>
                    <td className="px-3 py-2 font-mono text-navy">{f.classCount}</td>
                    <td className="px-3 py-2 text-muted">{timeAgo(f.lastSeenAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <Dropdown
                        trigger={<button className="p-1.5 rounded hover:bg-slate-100"><Icon name="more-horizontal" size={16} className="text-muted"/></button>}
                        items={[
                          { label:'Edit department / position', icon:'pencil',       onClick: () => openEdit(f) },
                          { label:'Change role',                icon:'key-round',    onClick: () => openRole(f) },
                          { label:'Assign to class',            icon:'book-marked',  onClick: () => openAssign(f) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEdit(null)}
        title="Edit Faculty Info"
        subtitle={editTarget?.name}
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setEdit(null)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleSubmit(onDeptSave)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Btn>
          </div>
        }
      >
        <div className="p-5 space-y-4">
          <Field label="Department">
            <input {...register('department')} placeholder="e.g. Science, Mathematics" className="w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"/>
          </Field>
          <Field label="Position">
            <input {...register('position')} placeholder="e.g. Teacher III · Adviser" className="w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"/>
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(roleTarget)}
        onClose={() => setRoleTarget(null)}
        title="Change Role"
        subtitle={roleTarget?.name}
        width="max-w-sm"
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setRoleTarget(null)}>Cancel</Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={onRoleSave}
              disabled={roleMutation.isPending || !roleTarget || roleValue === roleTarget?.role}
            >
              {roleMutation.isPending ? 'Saving…' : 'Save'}
            </Btn>
          </div>
        }
      >
        <div className="p-5 space-y-4">
          <Field label="Role">
            <select
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
              className="w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
            >
              <option value="school_admin">School Administrator</option>
              <option value="advisory_teacher">Advisory Teacher</option>
              <option value="subject_teacher">Subject Teacher</option>
            </select>
          </Field>
          {roleTarget && roleTarget.role === 'super_admin' && (
            <p className="text-[12px] text-red-600">Super-admin role cannot be changed from this screen.</p>
          )}
          <p className="text-[11.5px] text-muted">
            Current role: <span className="font-semibold text-navy">{ROLE_LABEL[roleTarget?.role] ?? roleTarget?.role}</span>
          </p>
        </div>
      </Modal>

      <Modal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title="Assign to Class"
        subtitle={assignTarget ? `${assignTarget.name} · Active school year` : ''}
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setAssignTarget(null)}>Cancel</Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={onAssignSave}
              disabled={!selectedClassId || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Assigning…' : 'Assign'}
            </Btn>
          </div>
        }
      >
        <div className="p-5 space-y-3">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
            <input
              value={assignQ}
              onChange={(e) => setAssignQ(e.target.value)}
              placeholder="Search by subject, section, or teacher…"
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
            />
          </div>
          {classesLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-md"/>)}</div>
          ) : filteredClasses.length === 0 ? (
            <EmptyState icon="book-marked" title="No classes" description="There are no class loads in the active school year."/>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-line border border-line rounded-md">
              {filteredClasses.map((c) => {
                const alreadyOwned = c.teacher.id === assignTarget?.id;
                const selected     = selectedClassId === c.id;
                return (
                  <li
                    key={c.id}
                    className={`px-3 py-2.5 flex items-start gap-3 text-[12.5px] ${alreadyOwned ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'} ${selected ? 'bg-primary/5' : ''}`}
                    onClick={() => { if (!alreadyOwned) setSelectedClassId(c.id); }}
                  >
                    <input
                      type="radio"
                      className="mt-0.5"
                      checked={selected}
                      disabled={alreadyOwned}
                      onChange={() => setSelectedClassId(c.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-navy">{c.subject.name}</div>
                      <div className="text-muted text-[11.5px]">
                        {c.section.gradeLevel} · {c.section.name} · {c.quarter}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {alreadyOwned ? 'Already assigned to this teacher' : `Currently: ${c.teacher.name || '—'}`}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
}

// ─── ALL CLASSES ─────────────────────────────────────────

const ELIGIBLE_TEACHER_ROLES = ['school_admin', 'advisory_teacher', 'subject_teacher'];

function AdminClasses({ classes, isLoading, schoolId, faculty }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassignTeacherId, setReassignTeacherId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const assignMutation = useAdminAssignTeacher(schoolId);
  const deleteMutation = useAdminDeleteClass(schoolId);

  const list = classes.filter((c) =>
    !q ||
    c.subject.name.toLowerCase().includes(q.toLowerCase()) ||
    c.section.name.toLowerCase().includes(q.toLowerCase()) ||
    c.teacher.name.toLowerCase().includes(q.toLowerCase()),
  );

  const eligibleTeachers = (faculty ?? []).filter((m) =>
    ELIGIBLE_TEACHER_ROLES.includes(m.role),
  );

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setModalOpen(true);
  }

  function openReassign(c) {
    setReassignTarget(c);
    setReassignTeacherId(c.teacher.id);
  }

  async function onReassignSave() {
    if (!reassignTarget || !reassignTeacherId || reassignTeacherId === reassignTarget.teacher.id) return;
    try {
      await assignMutation.mutateAsync({ classId: reassignTarget.id, teacherId: reassignTeacherId });
      toast?.push({ type: 'success', title: 'Teacher reassigned' });
      setReassignTarget(null);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Please try again.';
      toast?.push({ type: 'error', title: 'Could not reassign teacher', message: msg });
    }
  }

  async function onDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast?.push({ type: 'success', title: 'Class deleted' });
      setDeleteTarget(null);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Please try again.';
      toast?.push({ type: 'error', title: 'Could not delete class', message: msg });
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by subject, section, or teacher…" className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"/>
          </div>
          <span className="text-[12px] text-muted">{list.length} class{list.length !== 1 ? 'es' : ''}</span>
          <Btn size="sm" icon="plus" variant="primary" onClick={openCreate}>New class</Btn>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-md"/>)}</div>
        ) : list.length === 0 ? (
          <div className="py-10"><EmptyState icon="book-marked" title="No classes found" description="No class loads exist for the current school year. Click 'New class' to create one."/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Subject</th>
                  <th className="px-3 py-2.5 font-semibold">Grade · Section</th>
                  <th className="px-3 py-2.5 font-semibold">Teacher</th>
                  <th className="px-3 py-2.5 font-semibold">Students</th>
                  <th className="px-3 py-2.5 font-semibold">Quarter</th>
                  <th className="px-3 py-2.5 font-semibold w-12"/>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-slate-50/40">
                    <td className="px-3 py-2 font-semibold text-navy">{c.subject.name}</td>
                    <td className="px-3 py-2 text-navy">Grade {c.section.gradeLevel} · {c.section.name}</td>
                    <td className="px-3 py-2 text-navy">{c.teacher.name}</td>
                    <td className="px-3 py-2 font-mono text-navy">{c.studentCount}</td>
                    <td className="px-3 py-2"><Badge status="neutral">{c.quarter}</Badge></td>
                    <td className="px-3 py-2 text-right">
                      <Dropdown
                        trigger={<button className="p-1.5 rounded hover:bg-slate-100"><Icon name="more-horizontal" size={16} className="text-muted"/></button>}
                        items={[
                          { label: 'Edit class',       icon: 'pencil',      onClick: () => openEdit(c) },
                          { label: 'Reassign teacher', icon: 'user-cog',    onClick: () => openReassign(c) },
                          { label: 'Delete class',     icon: 'trash-2',     onClick: () => setDeleteTarget(c) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AdminClassModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        schoolId={schoolId}
        editing={editing}
      />

      <Modal
        open={Boolean(reassignTarget)}
        onClose={() => setReassignTarget(null)}
        title="Reassign teacher"
        subtitle={reassignTarget ? `${reassignTarget.subject.name} · ${reassignTarget.section.name}` : ''}
        width="max-w-sm"
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setReassignTarget(null)}>Cancel</Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={onReassignSave}
              disabled={
                assignMutation.isPending ||
                !reassignTeacherId ||
                reassignTeacherId === reassignTarget?.teacher.id
              }
            >
              {assignMutation.isPending ? 'Saving…' : 'Reassign'}
            </Btn>
          </div>
        }
      >
        <div className="p-5 space-y-3">
          <div className="text-[12px] text-muted">
            Currently assigned to <span className="font-semibold text-navy">{reassignTarget?.teacher.name || '—'}</span>
          </div>
          <Field label="New teacher">
            <select
              value={reassignTeacherId}
              onChange={(e) => setReassignTeacherId(e.target.value)}
              className="w-full h-9 px-3 text-[13px] rounded-md border border-line bg-white focus:border-primary focus:outline-none"
            >
              <option value="">Select a teacher…</option>
              {eligibleTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {ROLE_LABEL[t.role] ?? t.role}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete class"
        subtitle={deleteTarget ? `${deleteTarget.subject.name} · ${deleteTarget.section.name}` : ''}
        width="max-w-sm"
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
            <Btn
              variant="danger"
              size="sm"
              icon="trash-2"
              onClick={onDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete class'}
            </Btn>
          </div>
        }
      >
        <div className="p-5 space-y-2 text-[13px] text-navy">
          <p>This will deactivate the class load. Attendance and grade history will be preserved but the class will no longer appear in active lists.</p>
          <p className="text-muted text-[12px]">Teacher: <span className="font-semibold text-navy">{deleteTarget?.teacher.name}</span> · Quarter <span className="font-semibold text-navy">{deleteTarget?.quarter}</span></p>
        </div>
      </Modal>
    </>
  );
}

// ─── AUDIT LOG ───────────────────────────────────────────

function AdminAudit({ log, isLoading }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
        <h3 className="text-[14px] font-semibold text-navy">Activity log</h3>
        <span className="text-[12px] text-muted">School-wide · last 50 actions</span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-md"/>)}</div>
      ) : log.length === 0 ? (
        <div className="py-10"><EmptyState icon="list" title="No activity yet" description="Audit entries appear here as teachers submit attendance, save grades, and more."/></div>
      ) : (
        <ul className="divide-y divide-line">
          {log.map((e) => {
            const t = TONE_MAP[e.tone] ?? TONE_MAP.system;
            return (
              <li key={e.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50/40">
                <span className="w-9 h-9 rounded-md inline-flex items-center justify-center shrink-0" style={{ background:t.bg, color:t.fg }}>
                  <Icon name={t.icon} size={16}/>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-navy">
                    <span className="font-semibold">{e.actorName}</span> · {e.action} <span className="text-muted">→</span> <span className="text-navy">{e.target}</span>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">{timeAgo(e.createdAt)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ─── SCHOOL YEARS ────────────────────────────────────────

function AdminSchoolYears({ schoolId }) {
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing,   setEditing]     = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: years = [], isLoading } = useSchoolYears(schoolId);
  const create   = useCreateSchoolYear(schoolId ?? '');
  const update   = useUpdateSchoolYear(schoolId ?? '');
  const activate = useActivateSchoolYear(schoolId ?? '');
  const remove   = useDeleteSchoolYear(schoolId ?? '');
  const toast    = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schoolYearSchema),
  });

  function openAdd() { reset({ label: '', startDate: '', endDate: '' }); setEditing(null); setModalOpen(true); }
  function openEdit(y) { reset({ label: y.label, startDate: y.startDate, endDate: y.endDate }); setEditing(y); setModalOpen(true); }

  async function onSubmit(values) {
    try {
      if (editing) {
        await update.mutateAsync({ yearId: editing.id, payload: values });
        toast?.push({ type: 'success', title: 'School year updated' });
      } else {
        await create.mutateAsync(values);
        toast?.push({ type: 'success', title: 'School year created' });
      }
      setModalOpen(false);
    } catch {
      toast?.push({ type: 'error', title: 'Something went wrong' });
    }
  }

  async function handleActivate(yearId) {
    try {
      await activate.mutateAsync(yearId);
      toast?.push({ type: 'success', title: 'School year activated' });
    } catch {
      toast?.push({ type: 'error', title: 'Could not activate school year' });
    }
  }

  async function confirmDelete() {
    try {
      await remove.mutateAsync(deletingId);
      toast?.push({ type: 'success', title: 'School year deleted' });
    } catch (err) {
      toast?.push({ type: 'error', title: err?.response?.data?.message ?? 'Could not delete school year' });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
          <h3 className="text-[14px] font-semibold text-navy">School Years</h3>
          <span className="text-[12px] text-muted">{years.length} total</span>
          <span className="ml-auto"/>
          <Btn variant="primary" size="sm" icon="plus" onClick={openAdd}>Add School Year</Btn>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded-md"/>)}</div>
        ) : years.length === 0 ? (
          <div className="py-10">
            <EmptyState icon="calendar" title="No school years yet" description="Add a school year to get started."
              action={<Btn variant="primary" size="sm" icon="plus" onClick={openAdd}>Add School Year</Btn>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">School Year</th>
                  <th className="px-4 py-2.5 font-semibold">Period</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold w-12"/>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id} className="border-t border-line hover:bg-slate-50/40">
                    <td className="px-4 py-3 font-semibold text-navy">{y.label}</td>
                    <td className="px-4 py-3 text-muted font-mono text-[11.5px]">{fmtDate(y.startDate)} → {fmtDate(y.endDate)}</td>
                    <td className="px-4 py-3">
                      {y.isActive ? <Badge status="synced">Active</Badge> : <Badge status="pending">Inactive</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Dropdown
                        trigger={<button className="p-1.5 rounded hover:bg-slate-100"><Icon name="more-horizontal" size={16} className="text-muted"/></button>}
                        items={[
                          ...(!y.isActive ? [{ label:'Activate', icon:'check-circle', onClick: () => handleActivate(y.id) }] : []),
                          { label:'Edit', icon:'pencil', onClick: () => openEdit(y) },
                          ...(y.isActive ? [] : [{ separator:true }, { label:'Delete', icon:'trash-2', onClick: () => setDeletingId(y.id) }]),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit School Year' : 'Add School Year'}
        subtitle={editing ? `Editing "${editing.label}"` : 'Create a new school year for this school.'}
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Btn>
          </div>
        }
      >
        <div className="p-5 space-y-4">
          <Field label="Label" required error={errors.label?.message}>
            <TextInput {...register('label')} placeholder="e.g. S.Y. 2026–2027"/>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required error={errors.startDate?.message}>
              <TextInput type="date" {...register('startDate')}/>
            </Field>
            <Field label="End Date" required error={errors.endDate?.message}>
              <TextInput type="date" {...register('endDate')}/>
            </Field>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(deletingId)} onClose={() => setDeletingId(null)} title="Delete School Year" subtitle="This cannot be undone." width="max-w-sm"
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setDeletingId(null)}>Cancel</Btn>
            <Btn variant="danger" size="sm" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </Btn>
          </div>
        }
      >
        <div className="p-5">
          <p className="text-[13px] text-navy">Are you sure you want to delete this school year? All associated data will remain, but the school year record will be removed.</p>
        </div>
      </Modal>
    </>
  );
}

// ─── ROLES & ACCESS ──────────────────────────────────────

function AdminRoles({ faculty }) {
  const ROLES = [
    { key: 'school_admin',     label: 'School Administrator', desc: 'Full school-wide access: faculty, classes, settings, audit log.' },
    { key: 'advisory_teacher', label: 'Advisory Teacher',     desc: 'Class adviser: owns sections, takes attendance for all subjects in their advisory.' },
    { key: 'subject_teacher',  label: 'Subject Teacher',      desc: 'Assigned to specific class loads: attendance within schedule window, gradebook.' },
  ];

  const grouped = faculty.reduce((acc, f) => {
    acc[f.role] = acc[f.role] ? [...acc[f.role], f] : [f];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {ROLES.map((r) => {
        const members = grouped[r.key] ?? [];
        return (
          <Card key={r.key} className="p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-[15px] font-semibold text-navy">{r.label}</h3>
                <p className="text-[12px] text-muted mt-0.5 max-w-lg">{r.desc}</p>
              </div>
              <Badge status={ROLE_STATUS[r.key] ?? 'neutral'}>{members.length} member{members.length !== 1 ? 's' : ''}</Badge>
            </div>
            {members.length === 0 ? (
              <p className="text-[12px] text-muted mt-4 italic">No members yet.</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-line bg-surface text-[12.5px] text-navy">
                    <Avatar name={m.name} size="sm"/>
                    <span className="font-medium">{m.name}</span>
                    {m.department && <span className="text-muted">· {m.department}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
