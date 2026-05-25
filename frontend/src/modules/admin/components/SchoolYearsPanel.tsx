// @ts-nocheck
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Icon, Badge, Card, Modal, useToast,
  EmptyState, Skeleton, Btn, Dropdown, Field, TextInput,
} from '../../../components';
import {
  useSchoolYears,
  useCreateSchoolYear,
  useUpdateSchoolYear,
  useDeleteSchoolYear,
  useActivateSchoolYear,
} from '../../classrooms/useSchoolYears';
import { fmtDate } from './_shared';

const schoolYearSchema = z.object({
  label:     z.string().min(1, 'Label is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate:   z.string().min(1, 'End date is required'),
});

export function SchoolYearsPanel({ schoolId }) {
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
