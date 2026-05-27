import { useEffect } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Btn, Field, TextInput, Select } from '../../../components';
import { useUpdateStudent } from '../useStudents';
import { editStudentSchema } from '../student.schemas';
import type { Student } from '../../../shared/types';

interface EditStudentModalProps {
  open:      boolean;
  onClose:   () => void;
  student:   Student;
  onSuccess?: () => void;
}

export function EditStudentModal({ open, onClose, student, onSuccess }: EditStudentModalProps) {
  const updateMutation = useUpdateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(editStudentSchema) });

  useEffect(() => {
    if (open) {
      reset({
        lastName:             student.lastName,
        firstName:            student.firstName,
        middleName:           student.middleName           ?? '',
        gender:               student.gender,
        birthday:             student.birthday             ?? '',
        guardianName:         student.guardian?.name          ?? '',
        guardianRelationship: student.guardian?.relationship  ?? '',
        guardianContact:      student.guardian?.contactNumber ?? '',
      });
    }
  }, [open, student, reset]);

  const onSubmit = async (raw: FieldValues) => {
    try {
      await updateMutation.mutateAsync({
        id:      student.id,
        payload: {
          lastName:   raw.lastName,
          firstName:  raw.firstName,
          middleName: raw.middleName,
          gender:     raw.gender,
          birthday:   raw.birthday,
          guardian: {
            name:          raw.guardianName         ?? '',
            relationship:  raw.guardianRelationship ?? '',
            contactNumber: raw.guardianContact      ?? '',
          },
        },
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError('root', { message: msg ?? 'Failed to update student.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit student"
      subtitle={`${student.lastName}, ${student.firstName}`}
      width="max-w-2xl"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn
            variant="primary"
            icon="save"
            onClick={() => { void handleSubmit(onSubmit)(); }}
            disabled={isSubmitting || updateMutation.isPending}
          >
            {isSubmitting || updateMutation.isPending ? 'Saving…' : 'Save changes'}
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
        <div className="col-span-1" />
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
