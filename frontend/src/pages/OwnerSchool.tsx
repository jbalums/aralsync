// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Icon, Card, Btn, Tabs, Skeleton, Badge, EmptyState } from '../components';
import { schoolsService } from '../modules/classrooms/schools.service';
import { useSchoolYears } from '../modules/classrooms/useSchoolYears';
import { useAdminFaculty, useAdminAuditLog } from '../modules/admin/useAdmin';
import { SchoolOverviewPanel }    from '../modules/admin/components/SchoolOverviewPanel';
import { SchoolFacultyPanel }     from '../modules/admin/components/SchoolFacultyPanel';
import { SchoolClassesPanel }     from '../modules/admin/components/SchoolClassesPanel';
import { SchoolYearsPanel }       from '../modules/admin/components/SchoolYearsPanel';
import { SchoolAuditLogPanel }    from '../modules/admin/components/SchoolAuditLogPanel';
import { SchoolRolesAccessPanel } from '../modules/admin/components/SchoolRolesAccessPanel';

export function PageOwnerSchool() {
  const { schoolId } = useParams({ from: '/app/owner/schools/$schoolId' });
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const { data: school, isLoading, isError } = useQuery({
    queryKey: ['school', schoolId],
    queryFn:  () => schoolsService.getById(schoolId),
    enabled:  Boolean(schoolId),
    retry:    false,
  });

  const { data: years = [] }   = useSchoolYears(schoolId);
  const { data: faculty = [] } = useAdminFaculty(schoolId);
  const { data: log = [] }     = useAdminAuditLog(schoolId);

  const activeYear = years.find((y) => y.isActive);

  if (isLoading) {
    return (
      <div className="page-anim space-y-5">
        <Skeleton className="h-32 rounded-xl"/>
        <Skeleton className="h-10 rounded-md"/>
        <Skeleton className="h-64 rounded-xl"/>
      </div>
    );
  }

  if (isError || !school) {
    return (
      <div className="page-anim space-y-5">
        <EmptyState
          icon="building-2"
          title="School not found"
          description="The school you're looking for doesn't exist or could not be loaded."
          action={
            <Btn variant="primary" size="sm" icon="arrow-left" onClick={() => navigate({ to: '/app/owner' })}>
              Back to Owner Dashboard
            </Btn>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-anim space-y-5">
      <Card
        className="p-4 sm:p-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 70%, #3b82f6 130%)' }}
      >
        <div className="absolute inset-0 grid-bg opacity-20"/>
        <div className="relative flex items-start justify-between gap-3 flex-wrap text-white">
          <div className="min-w-0">
            <button
              onClick={() => navigate({ to: '/app/owner' })}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/80 hover:text-white transition-colors mb-2"
            >
              <Icon name="arrow-left" size={13}/> Back to Registered Schools
            </button>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold tracking-wider uppercase">
              <Icon name="building-2" size={12}/> School Profile
              <span className="mx-1 opacity-50">·</span>
              <span className="font-mono">{school.schoolId}</span>
              {school.isActive
                ? <Badge status="synced" className="ml-1.5">Active</Badge>
                : <Badge status="pending" className="ml-1.5">Inactive</Badge>}
            </div>
            <h2 className="text-[26px] font-semibold tracking-tight mt-2.5 truncate">{school.name}</h2>
            <p className="text-[13px] text-white/80 mt-1 max-w-xl">
              {school.division}{school.district ? ` · ${school.district}` : ''}{activeYear ? ` · ${activeYear.label}` : ''}
            </p>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id:'overview',     label:'School Overview', icon:'building-2' },
          { id:'faculty',      label:'Faculty',         icon:'users-round', count: faculty.length || undefined },
          { id:'classes',      label:'All Classes',     icon:'book-marked' },
          { id:'school_years', label:'School Years',    icon:'calendar',    count: years.length || undefined },
          { id:'audit',        label:'Audit Log',       icon:'list',        count: log.length || undefined },
          { id:'roles',        label:'Roles & Access',  icon:'key-round' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview'     && <SchoolOverviewPanel    schoolId={schoolId}/>}
      {tab === 'faculty'      && <SchoolFacultyPanel     schoolId={schoolId}/>}
      {tab === 'classes'      && <SchoolClassesPanel     schoolId={schoolId}/>}
      {tab === 'school_years' && <SchoolYearsPanel       schoolId={schoolId}/>}
      {tab === 'audit'        && <SchoolAuditLogPanel    schoolId={schoolId}/>}
      {tab === 'roles'        && <SchoolRolesAccessPanel schoolId={schoolId}/>}
    </div>
  );
}
