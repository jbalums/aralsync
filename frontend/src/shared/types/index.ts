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
  employeeNumber?: string;
  position?: string;
  avatarUrl?: string;
  schoolId?: string;
  role: UserRole;
  deviceId: string;
  refreshToken?: string;
  department?: string;
  lastSeenAt?: string;
}

export interface School {
  id: string;
  name: string;
  schoolId: string;
  division: string;
  district?: string;
  address?: string;
  isActive: boolean;
}

export interface SchoolYear {
  id: string;
  schoolId: string;
  label: string;
  startDate: string;
  endDate: string;
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
  middleInitial?: string;
  gender: 'M' | 'F';
  birthday?: string;
  guardian?: { name: string; relationship: string; contactNumber: string };
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

export interface ClassScheduleSlot {
  id?: string;
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  room?: string;
}

export interface ClassLoadDetail extends ClassLoadListItem {
  schedule: { dayOfWeek: number[]; timeStart: string; timeEnd: string };
  slots: ClassScheduleSlot[];
}

export interface AdminSummary {
  facultyCount: number;
  studentCount: number;
  sectionCount: number;
  classCount: number;
  schoolAvgAttendance: number;
  attendanceByDept: Array<{ dept: string; rate: number; studentCount: number }>;
  gradeDistribution: {
    highestHonors: number;
    highHonors: number;
    honors: number;
    passing: number;
    needsHelp: number;
  };
}

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  employeeNumber: string;
  position: string;
  classCount: number;
  lastSeenAt: string | null;
}

export interface AdminClass {
  id: string;
  subject: { name: string; gradeLevel: string };
  section: { name: string; gradeLevel: string };
  teacher: { id: string; name: string };
  quarter: Quarter;
  studentCount: number;
}

export interface AuditEntry {
  id: string;
  actorName: string;
  action: string;
  target: string;
  tone: string;
  createdAt: string;
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
