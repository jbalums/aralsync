import { http } from '../../services/http';
import type { AdminSummary, FacultyMember, AdminClass, AuditEntry } from '../../shared/types';

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
};
