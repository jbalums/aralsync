export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type Session = 'AM' | 'PM';
export type GradeComponent = 'WW' | 'PT' | 'QA';
export type SyncStatus = 'pending' | 'synced' | 'failed';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type UserRole = 'super_admin' | 'school_admin' | 'advisory_teacher' | 'subject_teacher';
export type ConnectionMode = 'cloud' | 'lan' | 'offline';

export interface User {
  id: string;
  email: string;
  name: string;
  schoolId: string;
  role: UserRole;
  deviceId: string;
  refreshToken?: string;
}

export interface School {
  id: string;
  name: string;
  division: string;
  district: string;
}

export interface SchoolYear {
  id: string;
  schoolId: string;
  label: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
}

export interface Section {
  id: string;
  schoolId: string;
  gradeLevel: string;
  name: string;
  adviserId: string;
}

export interface ClassLoad {
  id: string;
  teacherId: string;
  subjectId: string;
  sectionId: string;
  schoolYearId: string;
  quarter: Quarter;
  wwWeight: number;
  ptWeight: number;
  qaWeight: number;
}

export interface Student {
  id: string;
  lrn: string;
  sectionId: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  gender: 'M' | 'F';
  birthDate?: string;
}

export interface AttendanceRecord {
  id: string;
  classLoadId: string;
  studentId: string;
  date: string;
  session: Session;
  status: AttendanceStatus;
  syncStatus: SyncStatus;
  updatedAt: string;
}

export interface GradeEntry {
  id: string;
  classLoadId: string;
  studentId: string;
  quarter: Quarter;
  component: GradeComponent;
  columnLabel: string;
  score: number;
  maxScore: number;
  syncStatus: SyncStatus;
  updatedAt: string;
}

export interface QuarterlyGrade {
  id: string;
  classLoadId: string;
  studentId: string;
  quarter: Quarter;
  wwWeighted: number;
  ptWeighted: number;
  qaWeighted: number;
  initialGrade: number;
  transmutedGrade: number;
  syncStatus: SyncStatus;
}

export interface ClassLoadListItem {
  id: string;
  teacherId: string;
  subjectId: string;
  sectionId: string;
  schoolYearId: string;
  quarter: Quarter;
  roomNumber: string;
  scheduleTime: string;
  wwWeight: number;
  ptWeight: number;
  qaWeight: number;
  subject: { id: string; name: string; gradeLevel: string };
  section: { id: string; name: string; gradeLevel: string };
  studentCount: number;
}

export interface ClassLoadDetail extends ClassLoadListItem {
  schedule: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
}

export interface SyncQueueItem {
  id?: number;
  tableName: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  createdAt: string;
  retries: number;
}
