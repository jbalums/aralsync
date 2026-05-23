import Dexie, { type Table } from 'dexie';
import type {
  User, School, SchoolYear, Subject, Section, ClassLoad,
  Student, AttendanceRecord, GradeEntry, QuarterlyGrade, SyncQueueItem,
} from '../shared/types';

class AralSyncDB extends Dexie {
  users!: Table<User>;
  schools!: Table<School>;
  schoolYears!: Table<SchoolYear>;
  subjects!: Table<Subject>;
  sections!: Table<Section>;
  classLoads!: Table<ClassLoad>;
  students!: Table<Student>;
  attendanceRecords!: Table<AttendanceRecord>;
  gradeEntries!: Table<GradeEntry>;
  quarterlyGrades!: Table<QuarterlyGrade>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('AralSyncDB');
    this.version(1).stores({
      users:             '&id, email, schoolId, role',
      schools:           '&id, name, division, district',
      schoolYears:       '&id, schoolId, label, isActive',
      subjects:          '&id, schoolId, name, gradeLevel',
      sections:          '&id, schoolId, gradeLevel, name, adviserId',
      classLoads:        '&id, teacherId, subjectId, sectionId, schoolYearId, quarter, [subjectId+sectionId]',
      students:          '&id, lrn, sectionId, lastName, firstName, [sectionId+lastName]',
      attendanceRecords: '&id, classLoadId, studentId, date, session, status, syncStatus, updatedAt',
      gradeEntries:      '&id, classLoadId, studentId, quarter, component, columnLabel, score, maxScore, syncStatus, updatedAt',
      quarterlyGrades:   '&id, classLoadId, studentId, quarter, wwWeighted, ptWeighted, qaWeighted, initialGrade, transmutedGrade, syncStatus',
      syncQueue:         '++id, tableName, recordId, operation, payload, createdAt, retries',
    });
  }
}

export const db = new AralSyncDB();
