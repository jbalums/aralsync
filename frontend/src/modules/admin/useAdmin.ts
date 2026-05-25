import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from './admin.service';
import type { AdminCreateClassPayload, AdminUpdateClassPayload } from '../../shared/types';

export const ADMIN_KEYS = {
  summary:  (schoolId: string) => ['admin-summary',  schoolId] as const,
  faculty:  (schoolId: string) => ['admin-faculty',  schoolId] as const,
  classes:  (schoolId: string) => ['admin-classes',  schoolId] as const,
  auditLog: (schoolId: string) => ['admin-audit-log', schoolId] as const,
};

export function useAdminSummary(schoolId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.summary(schoolId ?? ''),
    queryFn:  () => adminService.getAdminSummary(schoolId!),
    enabled:  Boolean(schoolId),
  });
}

export function useAdminFaculty(schoolId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.faculty(schoolId ?? ''),
    queryFn:  () => adminService.getFaculty(schoolId!),
    enabled:  Boolean(schoolId),
  });
}

export function useAdminClasses(schoolId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.classes(schoolId ?? ''),
    queryFn:  () => adminService.getAllClasses(schoolId!),
    enabled:  Boolean(schoolId),
  });
}

export function useAdminAuditLog(schoolId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.auditLog(schoolId ?? ''),
    queryFn:  () => adminService.getAuditLog(schoolId!),
    enabled:  Boolean(schoolId),
  });
}

export function useUpdateFacultyMember(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { department?: string; position?: string } }) =>
      adminService.updateFacultyMember(schoolId, userId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_KEYS.faculty(schoolId) });
    },
  });
}

export function useUpdateFacultyRole(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: 'school_admin' | 'advisory_teacher' | 'subject_teacher';
    }) => adminService.updateFacultyRole(schoolId, userId, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_KEYS.faculty(schoolId) });
    },
  });
}

export function useAssignFacultyClass(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, classLoadId }: { userId: string; classLoadId: string }) =>
      adminService.assignFacultyClass(schoolId, userId, classLoadId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_KEYS.faculty(schoolId) });
      void qc.invalidateQueries({ queryKey: ADMIN_KEYS.classes(schoolId) });
      void qc.invalidateQueries({ queryKey: ['class-loads'] });
    },
  });
}

function invalidateClassesAndAudit(qc: ReturnType<typeof useQueryClient>, schoolId: string) {
  void qc.invalidateQueries({ queryKey: ADMIN_KEYS.classes(schoolId) });
  void qc.invalidateQueries({ queryKey: ADMIN_KEYS.faculty(schoolId) });
  void qc.invalidateQueries({ queryKey: ADMIN_KEYS.auditLog(schoolId) });
  void qc.invalidateQueries({ queryKey: ['class-loads'] });
}

export function useAdminCreateClass(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreateClassPayload) =>
      adminService.createClass(schoolId, payload),
    onSuccess: () => invalidateClassesAndAudit(qc, schoolId),
  });
}

export function useAdminUpdateClass(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, payload }: { classId: string; payload: AdminUpdateClassPayload }) =>
      adminService.updateClass(schoolId, classId, payload),
    onSuccess: () => invalidateClassesAndAudit(qc, schoolId),
  });
}

export function useAdminAssignTeacher(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, teacherId }: { classId: string; teacherId: string }) =>
      adminService.assignTeacher(schoolId, classId, teacherId),
    onSuccess: () => invalidateClassesAndAudit(qc, schoolId),
  });
}

export function useAdminDeleteClass(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => adminService.deleteClass(schoolId, classId),
    onSuccess: () => invalidateClassesAndAudit(qc, schoolId),
  });
}
