import { z } from 'zod';

export const createSchoolYearSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateFacultySchema = z.object({
  department: z.string().optional(),
  position:   z.string().optional(),
});

export const updateFacultyRoleSchema = z.object({
  role: z.enum(['school_admin', 'advisory_teacher', 'subject_teacher']),
});

export const assignClassLoadSchema = z.object({
  classLoadId: z.string().min(1, 'classLoadId is required'),
});

export const facultyUserParamSchema = z.object({
  id:     z.string().min(1),
  userId: z.string().min(1),
});

export const updateSchoolYearSchema = z
  .object({
    label:     z.string().min(1).optional(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    endDate:   z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' });

export const schoolIdParamSchema = z.object({ id: z.string().min(1) });

export const yearIdParamSchema = z.object({
  id: z.string().min(1),
  yearId: z.string().min(1),
});

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  schoolId: z.string().min(1, 'DepEd school ID is required'),
  division: z.string().min(2, 'Division is required'),
  district: z.string().optional(),
  address: z.string().optional(),
});

export const updateSchoolSchema = createSchoolSchema.partial();

export const updateSchoolInfoSchema = z.object({
  division: z.string().min(2).optional(),
  district: z.string().optional(),
  address:  z.string().optional(),
});

// ─── Admin class management ──────────────────────────────────

const adminWeightsSchema = z
  .object({
    ww: z.number().min(0).max(1),
    pt: z.number().min(0).max(1),
    qa: z.number().min(0).max(1),
  })
  .refine((w) => Math.abs(w.ww + w.pt + w.qa - 1) < 0.001, {
    message: 'Component weights must sum to 1.0',
  });

const adminTimeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM (24h)');

const adminSlotSchema = z
  .object({
    id: z.string().optional(),
    dayOfWeek: z.number().int().min(0).max(6),
    timeStart: adminTimeString,
    timeEnd:   adminTimeString,
    room:      z.string().optional(),
  })
  .refine(
    (s) => {
      const [sh, sm] = s.timeStart.split(':').map(Number);
      const [eh, em] = s.timeEnd.split(':').map(Number);
      return eh * 60 + em > sh * 60 + sm;
    },
    { message: 'timeEnd must be after timeStart', path: ['timeEnd'] },
  );

const adminScheduleSchema = z.object({
  dayOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  timeStart: z.string().default(''),
  timeEnd:   z.string().default(''),
});

export const adminCreateClassSchema = z.object({
  teacherId:   z.string().min(1, 'teacherId is required'),
  subjectName: z.string().min(1, 'Subject name is required'),
  gradeLevel:  z.number().int().min(7).max(12),
  sectionName: z.string().min(1, 'Section name is required'),
  quarter:     z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  roomNumber:  z.string().default(''),
  schedule:    adminScheduleSchema.optional(),
  slots:       z.array(adminSlotSchema).optional(),
  weights:     adminWeightsSchema.optional().default({ ww: 0.2, pt: 0.6, qa: 0.2 }),
});

export const adminUpdateClassSchema = z.object({
  roomNumber: z.string().optional(),
  quarter:    z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
  schedule:   adminScheduleSchema.optional(),
  slots:      z.array(adminSlotSchema).optional(),
  weights:    adminWeightsSchema.optional(),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().min(1, 'teacherId is required'),
});

export const classIdParamSchema = z.object({
  id:      z.string().min(1),
  classId: z.string().min(1),
});

export const bulkCreateSchoolsSchema = z.object({
  division: z.string().min(2, 'Division is required'),
  district: z.string().optional(),
  schools: z
    .array(
      z.object({
        schoolId: z.string().min(1),
        name: z.string().min(2),
        address: z.string().optional(),
      }),
    )
    .min(1, 'At least one school row is required')
    .max(500, 'Cannot import more than 500 schools at once'),
});
