import { http } from '../../services/http';
import type { School, SchoolYear } from '../../shared/types';

export interface CreateSchoolYearPayload {
  label: string;
  startDate: string;
  endDate: string;
}

export interface CreateSchoolPayload {
  name: string;
  schoolId: string;
  division: string;
  district?: string;
  address?: string;
}

export interface BulkSchoolRow {
  schoolId: string;
  name: string;
  address?: string;
}

export interface BulkCreateSchoolsPayload {
  division: string;
  district?: string;
  schools: BulkSchoolRow[];
}

export interface BulkRowIssue {
  schoolId: string;
  name: string;
  reason: string;
}

export interface BulkCreateSchoolsResult {
  created: number;
  skipped: BulkRowIssue[];
  failed: BulkRowIssue[];
}

export const schoolsService = {
  async listAll(): Promise<School[]> {
    const res = await http.get<{ data: School[] }>('/schools');
    return res.data.data;
  },

  async createSchool(payload: CreateSchoolPayload): Promise<School> {
    const res = await http.post<{ data: School }>('/schools', payload);
    return res.data.data;
  },

  async updateSchool(id: string, payload: Partial<CreateSchoolPayload>): Promise<School> {
    const res = await http.put<{ data: School }>(`/schools/${id}`, payload);
    return res.data.data;
  },

  async bulkCreateSchools(payload: BulkCreateSchoolsPayload): Promise<BulkCreateSchoolsResult> {
    const res = await http.post<{ data: BulkCreateSchoolsResult }>('/schools/bulk', payload);
    return res.data.data;
  },

  async getYears(schoolId: string): Promise<SchoolYear[]> {
    const res = await http.get<{ data: SchoolYear[] }>(`/schools/${schoolId}/years`);
    return res.data.data;
  },

  async createYear(schoolId: string, payload: CreateSchoolYearPayload): Promise<SchoolYear> {
    const res = await http.post<{ data: SchoolYear }>(`/schools/${schoolId}/years`, payload);
    return res.data.data;
  },

  async activateYear(schoolId: string, yearId: string): Promise<SchoolYear> {
    const res = await http.put<{ data: SchoolYear }>(
      `/schools/${schoolId}/years/${yearId}/activate`,
    );
    return res.data.data;
  },
};
