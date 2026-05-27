import { http } from '../../services/http';
import type { GradeComponent, Quarter } from '../../shared/types';

export interface GradeColumn {
  id:          string;   // `${component}-${columnLabel}`, e.g. 'WW-WW1'
  component:   GradeComponent;
  columnLabel: string;
  maxScore:    number;
}

export interface MatrixRow {
  student: {
    id:            string;
    lastName:      string;
    firstName:     string;
    middleName: string;
    lrn:           string;
  };
  scores: Record<string, { entryId: string | null; score: number | null }>;
}

export interface GradeMatrix {
  columns:     GradeColumn[];
  rows:        MatrixRow[];
  weights:     { ww: number; pt: number; qa: number };
  isFinalized: boolean;
}

export interface BulkSaveEntry {
  studentId:   string;
  component:   GradeComponent;
  columnLabel: string;
  maxScore:    number;
  score:       number;
}

export const gradeEntriesService = {
  async getMatrix(classLoadId: string, quarter: Quarter): Promise<GradeMatrix> {
    const res = await http.get<{ data: GradeMatrix }>('/grade-entries/matrix', {
      params: { classLoadId, quarter },
    });
    return res.data.data;
  },

  async bulkSave(classLoadId: string, quarter: Quarter, entries: BulkSaveEntry[]): Promise<void> {
    await http.post('/grade-entries/bulk', { classLoadId, quarter, entries });
  },
};
