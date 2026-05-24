import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classLoadsService, type CreateClassLoadPayload, type UpdateClassLoadPayload } from './classLoads.service';
import { SCHEDULE_KEYS } from '../schedules/useSchedules';

export const CLASS_LOAD_KEYS = {
  all: ['class-loads'] as const,
  detail: (id: string) => ['class-loads', id] as const,
  students: (id: string) => ['class-loads', id, 'students'] as const,
};

export function useClassLoads() {
  return useQuery({
    queryKey: CLASS_LOAD_KEYS.all,
    queryFn: () => classLoadsService.list(),
  });
}

export function useClassLoad(id: string) {
  return useQuery({
    queryKey: CLASS_LOAD_KEYS.detail(id),
    queryFn: () => classLoadsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useClassLoadStudents(id: string) {
  return useQuery({
    queryKey: CLASS_LOAD_KEYS.students(id),
    queryFn: () => classLoadsService.getStudents(id),
    enabled: Boolean(id),
  });
}

export function useCreateClassLoad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassLoadPayload) => classLoadsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CLASS_LOAD_KEYS.all });
    },
  });
}

export function useUpdateClassLoad(classId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClassLoadPayload) => classLoadsService.update(classId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CLASS_LOAD_KEYS.detail(classId) });
      void qc.invalidateQueries({ queryKey: CLASS_LOAD_KEYS.all });
      void qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.weekly });
    },
  });
}
