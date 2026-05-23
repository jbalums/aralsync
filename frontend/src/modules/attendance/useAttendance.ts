import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, type SubmitRecord } from './attendance.service';
import type { AttendanceStatus, Session } from '../../shared/types';

export const ATTENDANCE_KEYS = {
  all:     ['attendance'] as const,
  byDate:  (classLoadId: string, date: string, session: string) =>
    ['attendance', 'by-date', classLoadId, date, session] as const,
  summary: (classLoadId: string, startDate?: string, endDate?: string) =>
    ['attendance', 'summary', classLoadId, startDate, endDate] as const,
};

export function useAttendanceByDate(classLoadId: string, date: string, session: Session) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.byDate(classLoadId, date, session),
    queryFn:  () => attendanceService.getByDate({ classLoadId, date, session }),
    enabled:  Boolean(classLoadId) && Boolean(date) && Boolean(session),
  });
}

export function useAttendanceSummary(classLoadId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.summary(classLoadId, startDate, endDate),
    queryFn:  () => attendanceService.getSummary({ classLoadId, startDate, endDate }),
    enabled:  Boolean(classLoadId),
  });
}

export function useSubmitAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: SubmitRecord[]) => attendanceService.submit(records),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    },
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AttendanceStatus }) =>
      attendanceService.update(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    },
  });
}
