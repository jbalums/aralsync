import mongoose from 'mongoose';
import { ClassLoad } from '../../database/models/ClassLoad.model';
import { Student } from '../../database/models/Student.model';
import { AttendanceRecord } from '../../database/models/AttendanceRecord.model';
import { GradeEntry } from '../../database/models/GradeEntry.model';
import { QuarterlyGrade } from '../../database/models/QuarterlyGrade.model';

interface ClassLoadSummary {
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

interface TodayAggregate {
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
}

interface ActivityItem {
  type: 'attendance' | 'grade';
  label: string;
  when: string;
  tone: 'primary' | 'accent' | 'warning' | 'muted';
}

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function weekStart(weeksAgo: number): Date {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const d = new Date(now);
  d.setDate(now.getDate() + mondayOffset - weeksAgo * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const dashboardService = {
  async getSummary(teacherId: string) {
    const loads = await ClassLoad.find({ teacherId, isActive: true })
      .populate('subjectId', 'name gradeLevel')
      .populate('sectionId', 'name gradeLevel')
      .lean();

    if (loads.length === 0) {
      return {
        classLoads: [],
        todayAggregate: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
        recentActivity: [],
      };
    }

    const classLoadIds = loads.map((l) => l._id as mongoose.Types.ObjectId);
    const sectionIds = loads.map((l) => l.sectionId as mongoose.Types.ObjectId);

    // Student counts per section
    const studentCounts = await Student.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { sectionId: { $in: sectionIds }, isActive: true } },
      { $group: { _id: '$sectionId', count: { $sum: 1 } } },
    ]);
    const studentCountMap = new Map(studentCounts.map((c) => [c._id.toString(), c.count]));

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's overall attendance aggregate
    const todayStatusAgg = await AttendanceRecord.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          classLoadId: { $in: classLoadIds },
          date: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const todayAggregate: TodayAggregate = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
    for (const row of todayStatusAgg) {
      const key = row._id as keyof Omit<TodayAggregate, 'total'>;
      if (key in todayAggregate) todayAggregate[key] = row.count;
      todayAggregate.total += row.count;
    }

    // Today's attendance rate per class load
    const todayPerClass = await AttendanceRecord.aggregate<{
      _id: mongoose.Types.ObjectId;
      present: number;
      late: number;
      total: number;
    }>([
      {
        $match: {
          classLoadId: { $in: classLoadIds },
          date: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: '$classLoadId',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
    ]);
    const todayRateMap = new Map<string, number | null>(
      todayPerClass.map((r) => [
        r._id.toString(),
        r.total > 0 ? Math.round(((r.present + r.late) / r.total) * 100) : null,
      ]),
    );

    // Active quarter (most common across class loads, fallback Q1)
    const quarterCounts: Record<string, number> = {};
    for (const l of loads) { quarterCounts[l.quarter] = (quarterCounts[l.quarter] ?? 0) + 1; }
    const activeQuarter = Object.entries(quarterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Q1';

    // Average transmuted grade per class load
    const avgGradeAgg = await QuarterlyGrade.aggregate<{
      _id: mongoose.Types.ObjectId; avg: number;
    }>([
      { $match: { classLoadId: { $in: classLoadIds }, quarter: activeQuarter } },
      { $group: { _id: '$classLoadId', avg: { $avg: '$transmutedGrade' } } },
    ]);
    const avgGradeMap = new Map(
      avgGradeAgg.map((r) => [r._id.toString(), Math.round(r.avg * 10) / 10]),
    );

    // Gradebook progress: distinct columns filled + entry count per component per class
    const gradeProgressAgg = await GradeEntry.aggregate<{
      _id: { classLoadId: mongoose.Types.ObjectId; component: string };
      columnCount: number;
      entryCount: number;
    }>([
      { $match: { classLoadId: { $in: classLoadIds }, quarter: activeQuarter } },
      {
        $group: {
          _id: { classLoadId: '$classLoadId', component: '$component' },
          cols: { $addToSet: '$columnLabel' },
          entryCount: { $sum: 1 },
        },
      },
      { $addFields: { columnCount: { $size: '$cols' } } },
    ]);
    const progressMap = new Map<string, { WW: [number, number]; PT: [number, number]; QA: [number, number] }>();
    for (const row of gradeProgressAgg) {
      const clId = row._id.classLoadId.toString();
      if (!progressMap.has(clId)) {
        progressMap.set(clId, { WW: [0, 1], PT: [0, 1], QA: [0, 1] });
      }
      const comp = row._id.component as 'WW' | 'PT' | 'QA';
      const studentCount = studentCountMap.get(
        (loads.find((l) => (l._id as mongoose.Types.ObjectId).toString() === clId)
          ?.sectionId as mongoose.Types.ObjectId | undefined)?.toString() ?? '',
      ) ?? 1;
      const expected = Math.max(row.columnCount * studentCount, 1);
      progressMap.get(clId)![comp] = [row.entryCount, expected];
    }

    // 4-week attendance trend per class load (single aggregate)
    const fourWeeksAgoStart = weekStart(3);
    const weeklyRaw = await AttendanceRecord.aggregate<{
      _id: { classLoadId: mongoose.Types.ObjectId; isoWeek: number };
      present: number;
      late: number;
      total: number;
    }>([
      {
        $match: {
          classLoadId: { $in: classLoadIds },
          date: { $gte: fourWeeksAgoStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: {
            classLoadId: '$classLoadId',
            isoWeek: { $isoWeek: '$date' },
          },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
    ]);
    // Build week index map: week 3-ago=0, 2-ago=1, 1-ago=2, current=3
    const weekNumbers = [3, 2, 1, 0].map((w) => isoWeekNumber(weekStart(w)));
    const weeklyTrendMap = new Map<string, (number | null)[]>(
      classLoadIds.map((id) => [id.toString(), [null, null, null, null]]),
    );
    for (const row of weeklyRaw) {
      const trend = weeklyTrendMap.get(row._id.classLoadId.toString());
      if (!trend) continue;
      const idx = weekNumbers.indexOf(row._id.isoWeek);
      if (idx !== -1) {
        trend[idx] = row.total > 0
          ? Math.round(((row.present + row.late) / row.total) * 100)
          : null;
      }
    }

    // Recent activity: last 5 attendance + last 5 grade changes merged
    const [recentAtt, recentGrades] = await Promise.all([
      AttendanceRecord.find({ classLoadId: { $in: classLoadIds } })
        .sort({ updatedAt: -1 }).limit(5).lean(),
      QuarterlyGrade.find({ classLoadId: { $in: classLoadIds } })
        .sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    const recentActivity: ActivityItem[] = [
      ...recentAtt.map((r) => ({
        type: 'attendance' as const,
        label: `Attendance recorded — ${(r.date as Date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`,
        when: (r.updatedAt as Date).toISOString(),
        tone: (r.status === 'absent' ? 'warning' : 'primary') as 'primary' | 'warning',
      })),
      ...recentGrades.map((r) => ({
        type: 'grade' as const,
        label: `Grades computed — ${r.quarter}`,
        when: (r.updatedAt as Date).toISOString(),
        tone: 'accent' as const,
      })),
    ]
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 6);

    // Assemble per-class-load summaries
    const classLoads: ClassLoadSummary[] = loads.map((load) => {
      const subject = load.subjectId as { _id: mongoose.Types.ObjectId; name: string; gradeLevel: number };
      const section = load.sectionId as { _id: mongoose.Types.ObjectId; name: string; gradeLevel: number };
      const clId = (load._id as mongoose.Types.ObjectId).toString();
      const prog = progressMap.get(clId) ?? { WW: [0, 1] as [number, number], PT: [0, 1] as [number, number], QA: [0, 1] as [number, number] };

      return {
        id: clId,
        subject: subject.name,
        gradeLevel: `Grade ${subject.gradeLevel}`,
        section: section.name,
        room: load.roomNumber,
        quarter: load.quarter,
        studentCount: studentCountMap.get(section._id.toString()) ?? 0,
        weights: load.weights,
        todayAttendanceRate: todayRateMap.get(clId) ?? null,
        avgGrade: avgGradeMap.get(clId) ?? null,
        gradebookProgress: { ww: prog.WW, pt: prog.PT, qa: prog.QA },
        weeklyTrend: weeklyTrendMap.get(clId) ?? [null, null, null, null],
      };
    });

    return { classLoads, todayAggregate, recentActivity };
  },
};
