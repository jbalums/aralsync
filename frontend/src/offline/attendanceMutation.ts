import { db } from '../db';
import { enqueue } from './syncQueue';
import { queryClient } from '../app/queryClient';
import { ATTENDANCE_KEYS } from '../modules/attendance/useAttendance';
import type { AttendanceStatus, Session } from '../shared/types';

export interface AttendanceMutationInput {
  classLoadId: string;
  studentId:   string;
  date:        string;
  session:     Session;
  status:      AttendanceStatus;
}

export async function attendanceMutation(inputs: AttendanceMutationInput[]): Promise<void> {
  const now = new Date().toISOString();

  for (const input of inputs) {
    const existing = await db.attendanceRecords
      .where('classLoadId').equals(input.classLoadId)
      .filter(
        (r) => r.studentId === input.studentId &&
               r.date      === input.date       &&
               r.session   === input.session,
      )
      .first();

    if (existing) {
      await db.attendanceRecords.update(existing.id, {
        status:     input.status,
        syncStatus: 'pending',
        updatedAt:  now,
      });
      await enqueue({
        tableName: 'attendanceRecords',
        recordId:  existing.id,
        operation: 'update',
        payload:   { ...existing, status: input.status, updatedAt: now },
      });
    } else {
      const id = crypto.randomUUID();
      await db.attendanceRecords.add({
        id,
        classLoadId: input.classLoadId,
        studentId:   input.studentId,
        date:        input.date,
        session:     input.session,
        status:      input.status,
        syncStatus:  'pending',
        updatedAt:   now,
      });
      await enqueue({
        tableName: 'attendanceRecords',
        recordId:  id,
        operation: 'create',
        payload: {
          id,
          classLoadId: input.classLoadId,
          studentId:   input.studentId,
          date:        input.date,
          session:     input.session,
          status:      input.status,
          updatedAt:   now,
        },
      });
    }
  }

  void queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
}
