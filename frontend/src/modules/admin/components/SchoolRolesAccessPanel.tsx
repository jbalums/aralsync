// @ts-nocheck
import React from 'react';
import { Avatar, Badge, Card } from '../../../components';
import { useAdminFaculty } from '../useAdmin';
import { ROLE_STATUS } from './_shared';

const ROLES = [
  { key: 'school_admin',     label: 'School Administrator', desc: 'Full school-wide access: faculty, classes, settings, audit log.' },
  { key: 'advisory_teacher', label: 'Advisory Teacher',     desc: 'Class adviser: owns sections, takes attendance for all subjects in their advisory.' },
  { key: 'subject_teacher',  label: 'Subject Teacher',      desc: 'Assigned to specific class loads: attendance within schedule window, gradebook.' },
];

export function SchoolRolesAccessPanel({ schoolId }) {
  const { data: faculty = [] } = useAdminFaculty(schoolId);

  const grouped = faculty.reduce((acc, f) => {
    acc[f.role] = acc[f.role] ? [...acc[f.role], f] : [f];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {ROLES.map((r) => {
        const members = grouped[r.key] ?? [];
        return (
          <Card key={r.key} className="p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-[15px] font-semibold text-navy">{r.label}</h3>
                <p className="text-[12px] text-muted mt-0.5 max-w-lg">{r.desc}</p>
              </div>
              <Badge status={ROLE_STATUS[r.key] ?? 'neutral'}>{members.length} member{members.length !== 1 ? 's' : ''}</Badge>
            </div>
            {members.length === 0 ? (
              <p className="text-[12px] text-muted mt-4 italic">No members yet.</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-line bg-surface text-[12.5px] text-navy">
                    <Avatar name={m.name} size="sm"/>
                    <span className="font-medium">{m.name}</span>
                    {m.department && <span className="text-muted">· {m.department}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
