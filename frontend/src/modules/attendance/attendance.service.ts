import { http } from '../../services/http';
import type { AttendanceRecord, AttendanceStatus, Session } from '../../shared/types';

export interface AttendanceSummaryRow {
  studentId: string;
  total:     number;
  present:   number;
  late:      number;
  absent:    number;
  excused:   number;
  rate:      number;
}

export interface SubmitRecord {
  studentId:   string;
  classLoadId: string;
  date:        string;
  session:     Session;
  status:      AttendanceStatus;
  clientId?:   string;
}

export const attendanceService = {
  async getByDate(params: { classLoadId: string; date: string; session: Session }): Promise<AttendanceRecord[]> {
    const res = await http.get<{ data: AttendanceRecord[] }>('/attendance/by-date', { params });
    return res.data.data;
  },

  async getSummary(params: {
    classLoadId: string;
    startDate?:  string;
    endDate?:    string;
  }): Promise<AttendanceSummaryRow[]> {
    const res = await http.get<{ data: AttendanceSummaryRow[] }>('/attendance/summary', { params });
    return res.data.data;
  },

  async submit(records: SubmitRecord[]): Promise<AttendanceRecord[]> {
    const res = await http.post<{ data: AttendanceRecord[] }>('/attendance', { records });
    return res.data.data;
  },

  async update(id: string, status: AttendanceStatus): Promise<AttendanceRecord> {
    const res = await http.put<{ data: AttendanceRecord }>(`/attendance/${id}`, { status });
    return res.data.data;
  },

  async bulkSync(records: SubmitRecord[]): Promise<AttendanceRecord[]> {
    const res = await http.post<{ data: AttendanceRecord[] }>('/attendance/bulk-sync', { records });
    return res.data.data;
  },
};
