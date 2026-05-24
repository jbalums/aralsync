import { http } from '../../services/http';
import type {
  ClassLoadListItem,
  ClassLoadDetail,
  ClassScheduleSlot,
  Student,
  Quarter,
} from '../../shared/types';

export interface UpdateClassLoadPayload {
  roomNumber?: string;
  quarter?: Quarter;
  schedule?: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
  slots?: ClassScheduleSlot[];
  weights?: { ww: number; pt: number; qa: number };
}

export interface CreateClassLoadPayload {
  subjectName: string;
  gradeLevel: number;
  sectionName: string;
  quarter: Quarter;
  roomNumber?: string;
  schedule?: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
  slots?: ClassScheduleSlot[];
  weights: { ww: number; pt: number; qa: number };
}

export const classLoadsService = {
  async list(): Promise<ClassLoadListItem[]> {
    const res = await http.get<{ data: ClassLoadListItem[] }>('/class-loads');
    return res.data.data;
  },

  async getById(id: string): Promise<ClassLoadDetail> {
    const res = await http.get<{ data: ClassLoadDetail }>(`/class-loads/${id}`);
    return res.data.data;
  },

  async getStudents(id: string): Promise<Student[]> {
    const res = await http.get<{ data: Student[] }>(`/class-loads/${id}/students`);
    return res.data.data;
  },

  async create(payload: CreateClassLoadPayload): Promise<ClassLoadListItem> {
    const res = await http.post<{ data: ClassLoadListItem }>('/class-loads', payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdateClassLoadPayload): Promise<ClassLoadDetail> {
    const res = await http.patch<{ data: ClassLoadDetail }>(`/class-loads/${id}`, payload);
    return res.data.data;
  },
};
