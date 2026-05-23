import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentsService,
  type CreateStudentPayload,
  type StudentImportRow,
} from './students.service';

export const STUDENT_KEYS = {
  all:     ['students'] as const,
  list:    (filters: object) => ['students', 'list', filters] as const,
  detail:  (id: string) => ['students', id] as const,
  byLRN:   (lrn: string) => ['students', 'lrn', lrn] as const,
  summary: (id: string) => ['students', id, 'attendance-summary'] as const,
};

export function useStudents(params: {
  q?: string;
  classLoadId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: STUDENT_KEYS.list(params),
    queryFn: () => studentsService.list(params),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.detail(id),
    queryFn: () => studentsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useStudentByLRN(lrn: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.byLRN(lrn),
    queryFn: () => studentsService.getByLRN(lrn),
    enabled: lrn.length === 12,
    retry: false,
  });
}

export function useStudentAttendanceSummary(id: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.summary(id),
    queryFn: () => studentsService.getAttendanceSummary(id),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => studentsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}

export function useImportStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classLoadId, students }: { classLoadId: string; students: StudentImportRow[] }) =>
      studentsService.bulkImport(classLoadId, students),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}

export function useTransferStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, classLoadId }: { studentId: string; classLoadId: string }) =>
      studentsService.transfer(studentId, classLoadId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}
