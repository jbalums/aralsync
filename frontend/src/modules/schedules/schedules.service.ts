import { http } from '../../services/http';

export type ScheduleType = 'class' | 'duty' | 'meeting' | 'break';

export interface ScheduleBlock {
  id:          string;
  dayOfWeek:   number; // 1=Mon, ..., 6=Sat
  title:       string;
  section:     string;
  room:        string;
  startH:      number;
  startM:      number;
  durMin:      number;
  type:        ScheduleType;
  classLoadId?: string;
}

export interface CreateScheduleInput {
  title:        string;
  section:      string;
  room:         string;
  dayOfWeek:    number;
  startH:       number;
  startM:       number;
  durMin:       number;
  type:         ScheduleType;
  classLoadId?: string;
  schoolYearId?: string;
}

export interface ConflictResult {
  conflicts:   ScheduleBlock[];
  hasConflict: boolean;
}

export const schedulesService = {
  async getWeekly(): Promise<ScheduleBlock[]> {
    const res = await http.get<{ data: ScheduleBlock[] }>('/schedules/weekly');
    return res.data.data;
  },

  async create(input: CreateScheduleInput): Promise<ScheduleBlock> {
    const res = await http.post<{ data: ScheduleBlock }>('/schedules', input);
    return res.data.data;
  },

  async update(id: string, input: Partial<CreateScheduleInput>): Promise<ScheduleBlock> {
    const res = await http.put<{ data: ScheduleBlock }>(`/schedules/${id}`, input);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/schedules/${id}`);
  },

  async checkConflict(params: {
    dayOfWeek: number; startH: number; startM: number; durMin: number; excludeId?: string;
  }): Promise<ConflictResult> {
    const res = await http.post<{ data: ConflictResult }>('/schedules/check-conflict', params);
    return res.data.data;
  },
};
