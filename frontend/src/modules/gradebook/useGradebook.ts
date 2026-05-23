import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeEntriesService, type BulkSaveEntry } from './gradeEntries.service';
import { quarterlyGradesService } from './quarterlyGrades.service';
import type { Quarter } from '../../shared/types';

export const GRADE_KEYS = {
  all:         ['grades'] as const,
  matrix:      (classLoadId: string, quarter: Quarter) =>
    ['grades', 'matrix', classLoadId, quarter] as const,
  quarterly:   (classLoadId: string, quarter: Quarter) =>
    ['grades', 'quarterly', classLoadId, quarter] as const,
  classReport: (classLoadId: string, quarter: Quarter) =>
    ['grades', 'class-report', classLoadId, quarter] as const,
};

export function useGradeMatrix(classLoadId: string, quarter: Quarter) {
  return useQuery({
    queryKey: GRADE_KEYS.matrix(classLoadId, quarter),
    queryFn:  () => gradeEntriesService.getMatrix(classLoadId, quarter),
    enabled:  Boolean(classLoadId) && Boolean(quarter),
  });
}

export function useQuarterlyGrades(classLoadId: string, quarter: Quarter) {
  return useQuery({
    queryKey: GRADE_KEYS.quarterly(classLoadId, quarter),
    queryFn:  () => quarterlyGradesService.get(classLoadId, quarter),
    enabled:  Boolean(classLoadId) && Boolean(quarter),
  });
}

export function useClassReport(classLoadId: string, quarter: Quarter) {
  return useQuery({
    queryKey: GRADE_KEYS.classReport(classLoadId, quarter),
    queryFn:  () => quarterlyGradesService.getClassReport(classLoadId, quarter),
    enabled:  Boolean(classLoadId) && Boolean(quarter),
  });
}

export function useBulkSaveGrades() {
  return useMutation({
    mutationFn: ({
      classLoadId, quarter, entries,
    }: { classLoadId: string; quarter: Quarter; entries: BulkSaveEntry[] }) =>
      gradeEntriesService.bulkSave(classLoadId, quarter, entries),
  });
}

export function useComputeGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classLoadId, quarter }: { classLoadId: string; quarter: Quarter }) =>
      quarterlyGradesService.compute(classLoadId, quarter),
    onSuccess: (_data, { classLoadId, quarter }) => {
      void qc.invalidateQueries({ queryKey: GRADE_KEYS.quarterly(classLoadId, quarter) });
      void qc.invalidateQueries({ queryKey: GRADE_KEYS.classReport(classLoadId, quarter) });
      void qc.invalidateQueries({ queryKey: GRADE_KEYS.matrix(classLoadId, quarter) });
    },
  });
}

export function useFinalizeGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classLoadId, quarter }: { classLoadId: string; quarter: Quarter }) =>
      quarterlyGradesService.finalize(classLoadId, quarter),
    onSuccess: (_data, { classLoadId, quarter }) => {
      void qc.invalidateQueries({ queryKey: GRADE_KEYS.matrix(classLoadId, quarter) });
      void qc.invalidateQueries({ queryKey: GRADE_KEYS.quarterly(classLoadId, quarter) });
    },
  });
}
