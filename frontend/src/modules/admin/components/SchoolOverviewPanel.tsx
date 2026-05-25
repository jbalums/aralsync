// @ts-nocheck
import React from 'react';
import { Card, Skeleton, StatCard, SectionHeader } from '../../../components';
import { useAdminSummary } from '../useAdmin';
import { DEPT_COLORS } from './_shared';

export function SchoolOverviewPanel({ schoolId }) {
  const { data: summary } = useAdminSummary(schoolId);
  const loading = !summary;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl"/>)
        ) : (
          <>
            <StatCard icon="users-round"  label="Faculty"         value={summary.facultyCount}              color="primary" sub="Active teachers"/>
            <StatCard icon="users"        label="Students"        value={summary.studentCount}              color="accent"  sub={`Across ${summary.sectionCount} sections`}/>
            <StatCard icon="check-circle" label="School avg att." value={`${summary.schoolAvgAttendance}%`} color="blue"    sub="Last 30 days"/>
            <StatCard icon="layout-grid"  label="Sections"        value={summary.sectionCount}              color="amber"   sub="Active sections"/>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Attendance by department" subtitle="Last 30 days · all sections"/>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-8 rounded"/>)}</div>
          ) : summary.attendanceByDept.length === 0 ? (
            <p className="text-[12.5px] text-muted mt-3">No attendance data yet.</p>
          ) : (
            <div className="space-y-3 mt-2">
              {summary.attendanceByDept.map((row, i) => (
                <div key={row.dept}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1">
                    <span className="font-semibold text-navy">{row.dept}</span>
                    <span className="text-muted">{row.studentCount} students · <span className="font-mono text-navy font-semibold">{row.rate}%</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full" style={{ width:`${row.rate}%`, background: DEPT_COLORS[i % DEPT_COLORS.length] }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionHeader title="School-wide performance" subtitle="Grade bands · all quarterly grades"/>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded"/>)}</div>
          ) : (
            <div className="mt-2 space-y-2">
              {[
                { band:'≥98',   label:'Highest Honors', count: summary.gradeDistribution.highestHonors, color:'#0F766E' },
                { band:'95–97', label:'High Honors',    count: summary.gradeDistribution.highHonors,    color:'#10B981' },
                { band:'90–94', label:'With Honors',    count: summary.gradeDistribution.honors,        color:'#22C55E' },
                { band:'75–89', label:'Passing',        count: summary.gradeDistribution.passing,       color:'#3B82F6' },
                { band:'<75',   label:'Needs help',     count: summary.gradeDistribution.needsHelp,     color:'#EF4444' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{r.label}</div>
                    <div className="text-[10.5px] font-mono mt-0.5 px-1.5 py-0.5 rounded-full inline-block" style={{ background:`${r.color}22`, color:r.color }}>{r.band}</div>
                  </div>
                  <div className="text-[22px] font-bold font-mono text-navy">{r.count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
