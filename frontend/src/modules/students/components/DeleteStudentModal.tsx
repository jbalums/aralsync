import React, { useState, useEffect } from 'react';
import { Modal, Btn, TextInput } from '../../../components';
import { useDeleteStudent } from '../useStudents';
import type { Student } from '../../../shared/types';

interface DeleteStudentModalProps {
  open:      boolean;
  onClose:   () => void;
  student:   Student;
  onSuccess: () => void;
}

export function DeleteStudentModal({ open, onClose, student, onSuccess }: DeleteStudentModalProps) {
  const deleteMutation = useDeleteStudent();
  const [input, setInput] = useState('');

  const expectedName = `${student.firstName} ${student.lastName}`;
  const confirmed    = input.trim() === expectedName;

  useEffect(() => { if (open) setInput(''); }, [open]);

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(student.id);
    onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete student"
      subtitle="This action cannot be undone"
      width="max-w-md"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn
            variant="danger"
            icon="trash-2"
            onClick={() => { void handleDelete(); }}
            disabled={!confirmed || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete permanently'}
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
          <strong>{student.lastName}, {student.firstName}</strong>{' '}
          will be removed from all classes. Attendance and grade records are preserved
          but the student will no longer appear in any list.
        </div>
        <div>
          <label className="text-[13px] font-medium text-navy block mb-1.5">
            Type{' '}
            <span className="font-mono bg-slate-100 px-1 rounded">{expectedName}</span>{' '}
            to confirm
          </label>
          <TextInput
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder={expectedName}
          />
        </div>
      </div>
    </Modal>
  );
}
