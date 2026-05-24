import { http } from '../../services/http';
import type { Student } from '../../shared/types';

export interface StudentListItem extends Student {
  // All Student fields + optional section label
}

export interface StudentListResult {
  students: StudentListItem[];
  total: number;
  page: number;
  pages: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
}

export interface CreateStudentPayload {
  lrn: string;
  lastName: string;
  firstName: string;
  middleInitial?: string;
  gender: 'M' | 'F';
  birthday?: string;
  classLoadId: string;
  guardian?: { name: string; relationship: string; contactNumber: string };
}

export interface StudentImportRow {
  lrn: string;
  lastName: string;
  firstName: string;
  middleInitial?: string;
  gender: 'M' | 'F';
  birthday?: string;
  guardian?: { name: string; relationship: string; contactNumber: string };
}

export interface ImportResult {
  created: number;
  updated: number;
  failed: { lrn: string; reason: string }[];
}

export const studentsService = {
  async list(params: {
    q?: string;
    classLoadId?: string;
    page?: number;
    limit?: number;
  }): Promise<StudentListResult> {
    const res = await http.get<{ data: StudentListItem[]; meta: Omit<StudentListResult, 'students'> }>(
      '/students',
      { params },
    );
    return {
      students: res.data.data,
      total:    res.data.meta.total,
      page:     res.data.meta.page,
      pages:    res.data.meta.pages,
    };
  },

  async getById(id: string): Promise<Student> {
    const res = await http.get<{ data: Student }>(`/students/${id}`);
    return res.data.data;
  },

  async getByLRN(lrn: string): Promise<Student | null> {
    try {
      const res = await http.get<{ data: Student }>(`/students/lrn/${lrn}`);
      return res.data.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  async create(payload: CreateStudentPayload): Promise<Student> {
    const res = await http.post<{ data: Student }>('/students', payload);
    return res.data.data;
  },

  async update(id: string, payload: Partial<Omit<CreateStudentPayload, 'lrn' | 'classLoadId'>>): Promise<Student> {
    const res = await http.put<{ data: Student }>(`/students/${id}`, payload);
    return res.data.data;
  },

  async transfer(studentId: string, classLoadId: string): Promise<Student> {
    const res = await http.post<{ data: Student }>(`/students/${studentId}/transfer`, { classLoadId });
    return res.data.data;
  },

  async bulkImport(classLoadId: string, students: StudentImportRow[]): Promise<ImportResult> {
    const res = await http.post<{ data: ImportResult }>('/students/import', { classLoadId, students });
    return res.data.data;
  },

  async getAttendanceSummary(id: string): Promise<AttendanceSummary> {
    const res = await http.get<{ data: AttendanceSummary }>(`/students/${id}/attendance-summary`);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/students/${id}`);
  },
};
