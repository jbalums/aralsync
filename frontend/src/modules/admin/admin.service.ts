import { http } from '../../services/http';
import type {
  AdminSummary,
  FacultyMember,
  AdminClass,
  AdminCreateClassPayload,
  AdminUpdateClassPayload,
  AuditEntry,
} from '../../shared/types';

export const adminService = {
  async getAdminSummary(schoolId: string): Promise<AdminSummary> {
    const res = await http.get<{ data: AdminSummary }>(`/schools/${schoolId}/admin-summary`);
    return res.data.data;
  },

  async getFaculty(schoolId: string): Promise<FacultyMember[]> {
    const res = await http.get<{ data: FacultyMember[] }>(`/schools/${schoolId}/faculty`);
    return res.data.data;
  },

  async getAllClasses(schoolId: string): Promise<AdminClass[]> {
    const res = await http.get<{ data: AdminClass[] }>(`/schools/${schoolId}/classes`);
    return res.data.data;
  },

  async getAuditLog(schoolId: string, limit = 50): Promise<AuditEntry[]> {
    const res = await http.get<{ data: AuditEntry[] }>(`/schools/${schoolId}/audit-log`, {
      params: { limit },
    });
    return res.data.data;
  },

  async updateFacultyMember(
    schoolId: string,
    userId: string,
    data: { department?: string; position?: string },
  ): Promise<FacultyMember> {
    const res = await http.patch<{ data: FacultyMember }>(
      `/schools/${schoolId}/faculty/${userId}`,
      data,
    );
    return res.data.data;
  },

  async updateFacultyRole(
    schoolId: string,
    userId: string,
    role: 'school_admin' | 'advisory_teacher' | 'subject_teacher',
  ): Promise<FacultyMember> {
    const res = await http.patch<{ data: FacultyMember }>(
      `/schools/${schoolId}/faculty/${userId}/role`,
      { role },
    );
    return res.data.data;
  },

  async assignFacultyClass(
    schoolId: string,
    userId: string,
    classLoadId: string,
  ): Promise<{ classLoadId: string; teacherId: string; previousTeacherId: string }> {
    const res = await http.post<{
      data: { classLoadId: string; teacherId: string; previousTeacherId: string };
    }>(
      `/schools/${schoolId}/faculty/${userId}/class-assignments`,
      { classLoadId },
    );
    return res.data.data;
  },

  async createClass(
    schoolId: string,
    payload: AdminCreateClassPayload,
  ): Promise<{ id: string; teacherId: string; teacherName: string; subjectName: string; sectionName: string; gradeLevel: number }> {
    const res = await http.post<{
      data: { id: string; teacherId: string; teacherName: string; subjectName: string; sectionName: string; gradeLevel: number };
    }>(`/schools/${schoolId}/classes`, payload);
    return res.data.data;
  },

  async updateClass(
    schoolId: string,
    classId: string,
    payload: AdminUpdateClassPayload,
  ): Promise<{ id: string; subjectName: string; sectionName: string }> {
    const res = await http.patch<{
      data: { id: string; subjectName: string; sectionName: string };
    }>(`/schools/${schoolId}/classes/${classId}`, payload);
    return res.data.data;
  },

  async assignTeacher(
    schoolId: string,
    classId: string,
    teacherId: string,
  ): Promise<{ id: string; teacherId: string; teacherName: string; previousTeacherId: string }> {
    const res = await http.patch<{
      data: { id: string; teacherId: string; teacherName: string; previousTeacherId: string };
    }>(`/schools/${schoolId}/classes/${classId}/teacher`, { teacherId });
    return res.data.data;
  },

  async deleteClass(schoolId: string, classId: string): Promise<void> {
    await http.delete(`/schools/${schoolId}/classes/${classId}`);
  },
};
