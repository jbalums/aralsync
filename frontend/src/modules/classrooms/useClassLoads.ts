import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classLoadsService, type CreateClassLoadPayload } from './classLoads.service';

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
