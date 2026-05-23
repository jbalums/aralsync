import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolsService, type CreateSchoolYearPayload } from './schools.service';

export const SCHOOL_YEAR_KEYS = {
  list: (schoolId: string) => ['school-years', schoolId] as const,
};

export function useSchoolYears(schoolId: string | undefined) {
  return useQuery({
    queryKey: SCHOOL_YEAR_KEYS.list(schoolId ?? ''),
    queryFn: () => schoolsService.getYears(schoolId!),
    enabled: Boolean(schoolId),
  });
}

export function useCreateSchoolYear(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchoolYearPayload) =>
      schoolsService.createYear(schoolId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SCHOOL_YEAR_KEYS.list(schoolId) });
    },
  });
}

export function useActivateSchoolYear(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (yearId: string) => schoolsService.activateYear(schoolId, yearId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SCHOOL_YEAR_KEYS.list(schoolId) });
    },
  });
}
