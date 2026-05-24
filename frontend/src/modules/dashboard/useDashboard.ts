import { useQuery } from '@tanstack/react-query';
import { http } from '../../services/http';

export interface DashboardClassLoad {
  id: string;
  subject: string;
  gradeLevel: string;
  section: string;
  room: string;
  quarter: string;
  studentCount: number;
  weights: { ww: number; pt: number; qa: number };
  todayAttendanceRate: number | null;
  avgGrade: number | null;
  gradebookProgress: {
    ww: [number, number];
    pt: [number, number];
    qa: [number, number];
  };
  weeklyTrend: (number | null)[];
}

export interface DashboardSummary {
  classLoads: DashboardClassLoad[];
  todayAggregate: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
  };
  recentActivity: {
    type: 'attendance' | 'grade';
    label: string;
    when: string;
    tone: 'primary' | 'accent' | 'warning' | 'muted';
  }[];
}

export const DASHBOARD_KEYS = {
  summary: ['dashboard', 'summary'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summary,
    queryFn: async (): Promise<DashboardSummary> => {
      const res = await http.get<{ data: DashboardSummary }>('/dashboard/summary');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
