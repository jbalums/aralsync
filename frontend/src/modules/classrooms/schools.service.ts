import { http } from '../../services/http';
import type { SchoolYear } from '../../shared/types';

export interface CreateSchoolYearPayload {
  label: string;
  startDate: string;
  endDate: string;
}

export const schoolsService = {
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
