import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from './admin.service';

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
