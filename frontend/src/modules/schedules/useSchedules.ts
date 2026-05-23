import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesService, type CreateScheduleInput } from './schedules.service';

export const SCHEDULE_KEYS = {
  all:    ['schedules'] as const,
  weekly: ['schedules', 'weekly'] as const,
};

export function useWeeklySchedule() {
  return useQuery({
    queryKey: SCHEDULE_KEYS.weekly,
    queryFn:  () => schedulesService.getWeekly(),
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleInput) => schedulesService.create(input),
    onSuccess:  () => { void qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.weekly }); },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateScheduleInput> }) =>
      schedulesService.update(id, input),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.weekly }); },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesService.delete(id),
    onSuccess:  () => { void qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.weekly }); },
  });
}

export function useCheckConflict() {
  return useMutation({
    mutationFn: (params: { dayOfWeek: number; startH: number; startM: number; durMin: number; excludeId?: string }) =>
      schedulesService.checkConflict(params),
  });
}
