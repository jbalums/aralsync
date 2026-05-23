import { http } from '../../services/http';
import type { Quarter } from '../../shared/types';

export interface QuarterlyGradeRow {
  id:              string;
  classLoadId:     string;
  studentId:       string;
  quarter:         Quarter;
  wwWeighted:      number;
  ptWeighted:      number;
  qaWeighted:      number;
  initialGrade:    number;
  transmutedGrade: number;
  isFinalized:     boolean;
  syncStatus:      string;
  updatedAt:       string;
}

export interface ClassReportRow {
  student:         { id: string; lastName: string; firstName: string; lrn: string };
  transmutedGrade: number;
  initialGrade:    number;
  wwWeighted:      number;
  ptWeighted:      number;
  qaWeighted:      number;
  classification:  'withHighestHonors' | 'withHighHonors' | 'withHonors' | null;
  rank:            number;
}

export interface ClassReport {
  rows:  ClassReportRow[];
  stats: {
    classAvg:          number;
    passing:           number;
    passingPct:        number;
    withHonors:        number;
    withHighHonors:    number;
    withHighestHonors: number;
  };
}

export const quarterlyGradesService = {
  async get(classLoadId: string, quarter: Quarter): Promise<QuarterlyGradeRow[]> {
    const res = await http.get<{ data: QuarterlyGradeRow[] }>('/quarterly-grades', {
      params: { classLoadId, quarter },
    });
    return res.data.data;
  },

  async compute(classLoadId: string, quarter: Quarter): Promise<QuarterlyGradeRow[]> {
    const res = await http.post<{ data: QuarterlyGradeRow[] }>('/quarterly-grades/compute', {
      classLoadId, quarter,
    });
    return res.data.data;
  },

  async finalize(classLoadId: string, quarter: Quarter): Promise<{ finalized: number }> {
    const res = await http.post<{ data: { finalized: number } }>('/quarterly-grades/finalize', {
      classLoadId, quarter,
    });
    return res.data.data;
  },

  async getClassReport(classLoadId: string, quarter: Quarter): Promise<ClassReport> {
    const res = await http.get<{ data: ClassReport }>('/quarterly-grades/class-report', {
      params: { classLoadId, quarter },
    });
    return res.data.data;
  },
};
