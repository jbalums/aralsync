import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Icon, Card, Modal, StatCard, SectionHeader, Btn, Badge, Field, TextInput, useToast,
} from '../components';
import { schoolsService, type CreateSchoolPayload } from '../modules/classrooms/schools.service';
import { useAuthStore } from '../modules/auth/authStore';
import type { School } from '../shared/types';

const schoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  schoolId: z.string().min(1, 'DepEd school ID is required'),
  division: z.string().min(2, 'Division is required'),
  district: z.string().optional(),
  address: z.string().optional(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export function PageOwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { push } = useToast();
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<School | null>(null);

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolsService.listAll(),
    enabled: user?.role === 'super_admin',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolFormValues>({ resolver: zodResolver(schoolSchema) });

  const createMutation = useMutation({
    mutationFn: (data: CreateSchoolPayload) => schoolsService.createSchool(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['schools'] });
      push({ type: 'success', title: 'School created' });
      closeDialog();
    },
    onError: (err: Error) => {
      push({ type: 'error', title: err.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSchoolPayload> }) =>
      schoolsService.updateSchool(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['schools'] });
      push({ type: 'success', title: 'School updated' });
      closeDialog();
    },
    onError: (err: Error) => {
      push({ type: 'error', title: err.message });
    },
  });

  function openCreate() {
    setEditTarget(null);
    reset({ name: '', schoolId: '', division: '', district: '', address: '' });
    setDialogOpen(true);
  }

  function openEdit(school: School) {
    setEditTarget(school);
    reset({
      name: school.name,
      schoolId: school.schoolId,
      division: school.division,
      district: school.district ?? '',
      address: school.address ?? '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditTarget(null);
    reset();
  }

  function onSubmit(values: SchoolFormValues) {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="shield-off" size={40} className="text-muted mx-auto mb-3" />
          <p className="text-navy font-semibold">Not authorized</p>
          <p className="text-muted text-[13px] mt-1">This page is only accessible to platform owners.</p>
        </div>
      </div>
    );
  }

  const activeCount = schools.filter((s) => s.isActive).length;

  return (
    <div className="page-anim space-y-5">
      {/* Header */}
      <Card
        className="p-4 sm:p-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 70%, #3b82f6 130%)' }}
      >
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative flex items-start justify-between gap-3 flex-wrap text-white">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold tracking-wider uppercase">
              <Icon name="globe-2" size={12} /> Platform Owner · Super Admin
            </div>
            <h2 className="text-[26px] font-semibold tracking-tight mt-2.5">Owner Dashboard</h2>
            <p className="text-[13px] text-white/80 mt-1 max-w-xl">
              Manage all registered schools. Teachers can only register once their school is listed here.
            </p>
          </div>
          <Btn
            size="sm"
            icon="plus"
            className="bg-white! text-blue-800! hover:bg-blue-50!"
            onClick={openCreate}
          >
            Add School
          </Btn>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="building-2" label="Total Schools" value={schools.length} color="primary" />
        <StatCard icon="check-circle" label="Active" value={activeCount} color="accent" sub={`${schools.length - activeCount} inactive`} />
        <StatCard icon="users" label="Awaiting Teachers" value="—" color="blue" sub="Teachers register per school" />
        <StatCard icon="cloud" label="Sync Status" value="Live" color="primary" sub="Cloud mode" />
      </div>

      {/* Schools table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
          <SectionHeader title="Registered Schools" subtitle={`${schools.length} school${schools.length !== 1 ? 's' : ''} total`} />
          <span className="ml-auto" />
          <Btn variant="primary" size="sm" icon="plus" onClick={openCreate}>Add School</Btn>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted text-[13px]">Loading schools…</div>
        ) : schools.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="building-2" size={36} className="text-muted mx-auto mb-3" />
            <p className="text-navy font-semibold">No schools yet</p>
            <p className="text-muted text-[13px] mt-1 mb-4">Add the first school so teachers can start registering.</p>
            <Btn variant="primary" size="sm" icon="plus" onClick={openCreate}>Add School</Btn>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface text-muted text-left">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">School Name</th>
                  <th className="px-3 py-2.5 font-semibold">DepEd ID</th>
                  <th className="px-3 py-2.5 font-semibold">Division</th>
                  <th className="px-3 py-2.5 font-semibold">District</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold w-16" />
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-t border-line hover:bg-slate-50/40">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-navy">{school.name}</div>
                      {school.address && (
                        <div className="text-[11px] text-muted">{school.address}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-navy">{school.schoolId}</td>
                    <td className="px-3 py-2.5 text-navy/80">{school.division}</td>
                    <td className="px-3 py-2.5 text-navy/80">{school.district || '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge status={school.isActive ? 'synced' : 'pending'}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => openEdit(school)}
                        className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-navy tx"
                        title="Edit school"
                      >
                        <Icon name="pencil" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        title={editTarget ? 'Edit School' : 'Add School'}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="School Name" required hint={errors.name?.message}>
            <TextInput
              {...register('name')}
              placeholder="e.g. Rizal National High School"
              className={errors.name ? 'border-red-400' : ''}
            />
          </Field>

          <Field label="DepEd School ID" required hint={errors.schoolId?.message}>
            <TextInput
              {...register('schoolId')}
              placeholder="e.g. 301034"
              disabled={!!editTarget}
              className={errors.schoolId ? 'border-red-400' : ''}
            />
          </Field>

          <Field label="Division" required hint={errors.division?.message}>
            <TextInput
              {...register('division')}
              placeholder="e.g. Division of Laguna"
              className={errors.division ? 'border-red-400' : ''}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="District" hint={errors.district?.message}>
              <TextInput
                {...register('district')}
                placeholder="e.g. Calamba District 1"
              />
            </Field>
            <Field label="Address">
              <TextInput
                {...register('address')}
                placeholder="e.g. Brgy. Real, Calamba"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" size="sm" type="button" onClick={closeDialog}>
              Cancel
            </Btn>
            <Btn
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? 'Save Changes' : 'Create School'}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
