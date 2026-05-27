import { http } from '../../services/http';

// ── SF2 ──────────────────────────────────────────────────────────────────────
export interface Sf2StudentRow {
  id:          string;
  lastName:    string;
  firstName:   string;
  lrn:         string;
  attendance:  Record<number, string>;
  totalAbsent: number;
  totalLate:   number;
}

export interface Sf2Sheet {
  classLoad: {
    subject:     string;
    section:     string;
    gradeLevel:  number;
    quarter:     string;
    roomNumber:  string;
    teacherName: string;
  };
  month:      string;
  year:       number;
  monthIndex: number;
  schoolDays: number[];
  students:   Sf2StudentRow[];
}

// ── Report card ───────────────────────────────────────────────────────────────
export interface ReportCardSubject {
  subjectName: string;
  classLoadId: string;
  grades:      Record<string, number | null>; // Q1..Q4
  finalGrade:  number;
  passed:      boolean;
}

export interface ReportCard {
  student: {
    id:            string;
    lastName:      string;
    firstName:     string;
    middleName: string;
    lrn:           string;
    sectionName:   string;
    gradeLevel:    number;
  };
  schoolYear:     { id: string; label: string };
  subjects:       ReportCardSubject[];
  generalAverage: number;
  classification: string | null;
}

// ── Class report (re-export shape from quarterlyGrades.service) ──────────────
export interface ClassReportStats {
  classAvg:          number;
  passing:           number;
  passingPct:        number;
  withHonors:        number;
  withHighHonors:    number;
  withHighestHonors: number;
}

export const reportsService = {
  async getSf2Sheet(classLoadId: string, month: string): Promise<Sf2Sheet> {
    const res = await http.get<{ data: Sf2Sheet }>('/attendance/sf2-sheet', {
      params: { classLoadId, month },
    });
    return res.data.data;
  },

  async getReportCard(studentId: string, schoolYearId: string): Promise<ReportCard> {
    const res = await http.get<{ data: ReportCard }>('/quarterly-grades/report-card', {
      params: { studentId, schoolYearId },
    });
    return res.data.data;
  },
};
