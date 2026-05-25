// @ts-nocheck
import React from 'react';
import { Icon, Card, EmptyState, Skeleton } from '../../../components';
import { useAdminAuditLog } from '../useAdmin';
import { timeAgo, TONE_MAP } from './_shared';

export function SchoolAuditLogPanel({ schoolId }) {
  const { data: log = [], isLoading } = useAdminAuditLog(schoolId);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center gap-3 flex-wrap">
        <h3 className="text-[14px] font-semibold text-navy">Activity log</h3>
        <span className="text-[12px] text-muted">School-wide · last 50 actions</span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-md"/>)}</div>
      ) : log.length === 0 ? (
        <div className="py-10"><EmptyState icon="list" title="No activity yet" description="Audit entries appear here as teachers submit attendance, save grades, and more."/></div>
      ) : (
        <ul className="divide-y divide-line">
          {log.map((e) => {
            const t = TONE_MAP[e.tone] ?? TONE_MAP.system;
            return (
              <li key={e.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50/40">
                <span className="w-9 h-9 rounded-md inline-flex items-center justify-center shrink-0" style={{ background:t.bg, color:t.fg }}>
                  <Icon name={t.icon} size={16}/>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-navy">
                    <span className="font-semibold">{e.actorName}</span> · {e.action} <span className="text-muted">→</span> <span className="text-navy">{e.target}</span>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">{timeAgo(e.createdAt)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
