// @ts-nocheck
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Icon, Avatar, Badge, Card, Modal, useToast,
  EmptyState, Skeleton, Btn, Dropdown, Field,
} from '../../../components';
import {
  useAdminFaculty,
  useAdminClasses,
  useUpdateFacultyMember,
  useUpdateFacultyRole,
  useAssignFacultyClass,
} from '../useAdmin';
import { timeAgo, ROLE_LABEL, ROLE_STATUS } from './_shared';

const deptEditSchema = z.object({
  department: z.string(),
  position:   z.string(),
});

export function SchoolFacultyPanel({ schoolId }) {
  const { data: faculty = [], isLoading } = useAdminFaculty(schoolId);
  const { data: allClasses = [], isLoading: classesLoading } = useAdminClasses(schoolId);

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
