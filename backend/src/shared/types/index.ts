import 'express';

export enum Role {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  ADVISORY_TEACHER = 'advisory_teacher',
  SUBJECT_TEACHER = 'subject_teacher',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum Session {
  AM = 'AM',
  PM = 'PM',
}

export enum GradeComponent {
  WW = 'WW',
  PT = 'PT',
  QA = 'QA',
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  schoolId?: string;
  deviceId?: string;
}

export interface IWeights {
  ww: number;
  pt: number;
  qa: number;
}

export interface IScheduleSlot {
  dayOfWeek: number[];
  timeStart: string;
  timeEnd: string;
}

export interface IGuardian {
  name: string;
  relationship: string;
  contactNumber: string;
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  employeeNumber: string;
  position: string;
  schoolId?: string;
  role: Role;
  devices: {
    deviceId: string;
    name: string;
    type: 'tablet' | 'laptop' | 'phone' | 'desktop' | 'other';
    userAgent: string;
    createdAt: Date;
    lastSeenAt: Date;
  }[];
  refreshTokens: string[];
  isActive: boolean;
}

export interface ISchool {
  _id: string;
  name: string;
  schoolId: string;
  division: string;
  district: string;
  address: string;
  isActive: boolean;
}

export interface ISchoolYear {
  _id: string;
  schoolId: string;
  label: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface ISubject {
  _id: string;
  schoolId: string;
  name: string;
  gradeLevel: number;
  description: string;
  isActive: boolean;
}

export interface ISection {
  _id: string;
  schoolId: string;
  gradeLevel: number;
  name: string;
  adviserId: string;
  schoolYearId: string;
  isActive: boolean;
}

export interface IClassLoad {
  _id: string;
  teacherId: string;
  subjectId: string;
  sectionId: string;
  schoolYearId: string;
  quarter: Quarter;
  roomNumber: string;
  schedule: IScheduleSlot;
  weights: IWeights;
  isActive: boolean;
}

export interface IStudent {
  _id: string;
  lrn: string;
  lastName: string;
  firstName: string;
  middleInitial: string;
  gender: string;
  birthday: Date;
  sectionId: string;
  schoolId: string;
  guardian: IGuardian;
  isActive: boolean;
}

export interface IAttendanceRecord {
  _id: string;
  classLoadId: string;
  studentId: string;
  date: Date;
  session: Session;
  status: AttendanceStatus;
  recordedBy: string;
  syncStatus: SyncStatus;
  clientId: string;
  updatedAt: Date;
}

export interface IGradeEntry {
  _id: string;
  classLoadId: string;
  studentId: string;
  quarter: Quarter;
  component: GradeComponent;
  columnLabel: string;
  score: number;
  maxScore: number;
  recordedBy: string;
  syncStatus: SyncStatus;
  clientId: string;
  updatedAt: Date;
}

export interface IQuarterlyGrade {
  _id: string;
  classLoadId: string;
  studentId: string;
  quarter: Quarter;
  wwWeighted: number;
  ptWeighted: number;
  qaWeighted: number;
  initialGrade: number;
  transmutedGrade: number;
  isFinalized: boolean;
  finalizedBy?: string;
  syncStatus: SyncStatus;
  updatedAt: Date;
}

export interface ISchedule {
  _id: string;
  classLoadId: string;
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  roomNumber: string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
