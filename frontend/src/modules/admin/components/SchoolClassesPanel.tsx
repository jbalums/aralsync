// @ts-nocheck
import React, { useState } from 'react';
import {
  Icon, Badge, Card, Modal, useToast,
  EmptyState, Skeleton, Btn, Dropdown, Field,
} from '../../../components';
import {
  useAdminClasses,
  useAdminFaculty,
  useAdminAssignTeacher,
  useAdminDeleteClass,
} from '../useAdmin';
import { AdminClassModal } from '../../../components/classes/AdminClassModal';
import { ROLE_LABEL, ELIGIBLE_TEACHER_ROLES } from './_shared';

export function SchoolClassesPanel({ schoolId }) {
  const { data: classes = [], isLoading } = useAdminClasses(schoolId);
  const { data: faculty = [] } = useAdminFaculty(schoolId);

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
