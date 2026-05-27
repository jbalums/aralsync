import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Btn, Field, TextInput, Select } from '../../../components';
import { useCreateStudent, useStudentByLRN } from '../useStudents';
import { addStudentSchema, type AddStudentFormValues } from '../student.schemas';
import { validateLRN } from '../../../shared/utils/lrn';
import type { ClassLoadListItem } from '../../../shared/types';

interface AddStudentModalProps {
  open:       boolean;
  onClose:    () => void;
  classLoads: ClassLoadListItem[];
  onSuccess?: () => void;
}

export function AddStudentModal({ open, onClose, classLoads, onSuccess }: AddStudentModalProps) {
  const createMutation = useCreateStudent();
  const [lrnTouched, setLrnTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({ resolver: zodResolver(addStudentSchema), defaultValues: { gender: 'F' } });

  const lrnValue = watch('lrn') ?? '';
  const { data: dupStudent } = useStudentByLRN(lrnTouched && lrnValue.length === 12 ? lrnValue : '');

  const handleClose = () => { onClose(); reset(); };

  const onSubmit = async (values: AddStudentFormValues) => {
    try {
      await createMutation.mutateAsync({
        lrn:          values.lrn,
        lastName:     values.lastName,
        firstName:    values.firstName,
        middleName:   values.middleName,
        gender:       values.gender,
        birthday:     values.birthday,
        classLoadId:  values.classLoadId,
        guardian: {
          name:          values.guardianName         ?? '',
          relationship:  values.guardianRelationship ?? '',
          contactNumber: values.guardianContact      ?? '',
        },
      });
      onSuccess?.();
      reset();
      onClose();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError('root', { message: msg ?? 'Failed to add student.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add student"
      subtitle="Adds a learner to the selected class load"
      width="max-w-2xl"
      footer={
        <>
          <Btn variant="ghost" onClick={handleClose}>Cancel</Btn>
          <Btn
            variant="primary"
            icon="user-plus"
            onClick={() => { void handleSubmit(onSubmit)(); }}
            disabled={isSubmitting || createMutation.isPending}
          >
            {isSubmitting || createMutation.isPending ? 'Adding…' : 'Add learner'}
          </Btn>
        </>
      }
    >
      <form className="grid grid-cols-3 gap-3" noValidate>
        {errors.root && (
          <div className="col-span-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {errors.root.message}
          </div>
        )}

        <div className="col-span-3">
          <label className="text-[13px] font-medium text-navy block mb-1">
            LRN (12 digits) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={12}
            {...register('lrn', {
              onBlur: (e) => {
                setLrnTouched(true);
                const val = e.target.value;
                if (val.length === 12 && !validateLRN(val)) {
                  setError('lrn', { message: 'Invalid LRN - check digit does not match' });
                } else {
                  clearErrors('lrn');
                }
              },
            })}
            placeholder="105432100123"
            className="h-[42px] w-full px-3 rounded-lg border text-[14px] bg-white outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 border-line"
          />
          {errors.lrn && (
            <span className="text-[12px] text-red-500 mt-1 block">{errors.lrn.message}</span>
          )}
          {dupStudent && !errors.lrn && (
            <span className="text-[12px] text-amber-600 mt-1 block">
              Warning: LRN already exists - {dupStudent.lastName}, {dupStudent.firstName}
            </span>
          )}
        </div>

        <Field label="Last name"  required error={errors.lastName?.message}>
          <TextInput placeholder="dela Cruz" {...register('lastName')} />
        </Field>
        <Field label="First name" required error={errors.firstName?.message}>
          <TextInput placeholder="Juan" {...register('firstName')} />
        </Field>
        <Field label="Middle name">
          <TextInput placeholder="Reyes" {...register('middleName')} />
        </Field>
        <Field label="Gender">
          <Select {...register('gender')}>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </Select>
        </Field>
        <Field label="Birthday">
          <TextInput type="date" {...register('birthday')} />
        </Field>
        <Field label="Class load" required error={errors.classLoadId?.message}>
          <Select {...register('classLoadId')}>
            <option value="">Select class…</option>
            {classLoads.map((c) => (
              <option key={c.id} value={c.id}>
                {c.section.gradeLevel} · {c.section.name} · {c.subject.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Guardian name">
          <TextInput placeholder="Rosario dela Cruz" {...register('guardianName')} />
        </Field>
        <Field label="Relationship">
          <TextInput placeholder="Mother" {...register('guardianRelationship')} />
        </Field>
        <Field label="Contact number">
          <TextInput placeholder="+63 917 123 4567" {...register('guardianContact')} />
        </Field>
      </form>
    </Modal>
  );
}
