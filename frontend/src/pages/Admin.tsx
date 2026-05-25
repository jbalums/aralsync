// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon, Card, Btn, Tabs } from '../components';
import { useAuthStore } from '../modules/auth/authStore';
import { useSchoolYears } from '../modules/classrooms/useSchoolYears';
import { schoolsService } from '../modules/classrooms/schools.service';
import { useAdminSummary, useAdminFaculty, useAdminAuditLog } from '../modules/admin/useAdmin';
import { SchoolOverviewPanel }    from '../modules/admin/components/SchoolOverviewPanel';
import { SchoolFacultyPanel }     from '../modules/admin/components/SchoolFacultyPanel';
import { SchoolClassesPanel }     from '../modules/admin/components/SchoolClassesPanel';
import { SchoolYearsPanel }       from '../modules/admin/components/SchoolYearsPanel';
import { SchoolAuditLogPanel }    from '../modules/admin/components/SchoolAuditLogPanel';
import { SchoolRolesAccessPanel } from '../modules/admin/components/SchoolRolesAccessPanel';

export function PageAdmin({ setRoute }) {
  const [tab, setTab] = useState('overview');
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId;

  const { data: school }    = useQuery({
    queryKey: ['school', schoolId],
    queryFn:  () => schoolsService.getById(schoolId!),
    enabled:  Boolean(schoolId),
  });
  const { data: years = [] } = useSchoolYears(schoolId);
  const { data: summary }    = useAdminSummary(schoolId);
  const { data: faculty = [] } = useAdminFaculty(schoolId);
  const { data: log = [] }   = useAdminAuditLog(schoolId);

  const activeYear = years.find((y) => y.isActive);

  const headerDesc = school
    ? `${school.name} · ${school.division}${activeYear ? ` · ${activeYear.label}` : ''}. School-wide oversight for ${summary?.facultyCount ?? '—'} teachers, ${summary?.sectionCount ?? '—'} sections, ${summary?.studentCount ?? '—'} students.`
    : 'Loading school information…';

  return (
    <div className="page-anim space-y-5">
      <Card className="p-4 sm:p-5 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0D5E57 0%, #0F766E 70%, #10B981 130%)' }}>
        <div className="absolute inset-0 grid-bg opacity-20"/>
        <div className="relative flex items-start justify-between gap-3 flex-wrap text-white">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold tracking-wider uppercase">
              <Icon name="shield-check" size={12}/> School Administrator · Full access
            </div>
            <h2 className="text-[26px] font-semibold tracking-tight mt-2.5">Admin Console</h2>
            <p className="text-[13px] text-white/80 mt-1 max-w-xl">{headerDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" icon="download" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">Export school data</Btn>
            <Btn size="sm" icon="settings" className="!bg-white !text-primary-dark hover:!bg-primary-light" onClick={() => setRoute?.('settings')}>School settings</Btn>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id:'overview',     label:'School Overview', icon:'building-2' },
          { id:'faculty',      label:'Faculty',         icon:'users-round', count: faculty.length || undefined },
          { id:'classes',      label:'All Classes',     icon:'book-marked' },
          { id:'school_years', label:'School Years',    icon:'calendar' },
          { id:'audit',        label:'Audit Log',       icon:'list',        count: log.length || undefined },
          { id:'roles',        label:'Roles & Access',  icon:'key-round' },
        ]}
        active={tab} onChange={setTab}
      />

      {schoolId && (
        <>
          {tab === 'overview'     && <SchoolOverviewPanel    schoolId={schoolId}/>}
          {tab === 'faculty'      && <SchoolFacultyPanel     schoolId={schoolId}/>}
          {tab === 'classes'      && <SchoolClassesPanel     schoolId={schoolId}/>}
          {tab === 'school_years' && <SchoolYearsPanel       schoolId={schoolId}/>}
          {tab === 'audit'        && <SchoolAuditLogPanel    schoolId={schoolId}/>}
          {tab === 'roles'        && <SchoolRolesAccessPanel schoolId={schoolId}/>}
        </>
      )}
    </div>
  );
}
