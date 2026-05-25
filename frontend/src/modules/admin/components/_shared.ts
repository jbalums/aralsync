// @ts-nocheck
// Shared helpers used across the School admin/profile panels.

export function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5)  return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

export const ROLE_LABEL = {
  school_admin:     'School Administrator',
  advisory_teacher: 'Advisory Teacher',
  subject_teacher:  'Subject Teacher',
  super_admin:      'Super Admin',
};

export const ROLE_STATUS = {
  school_admin:     'primary',
  advisory_teacher: 'synced',
  subject_teacher:  'neutral',
  super_admin:      'primary',
};

export const DEPT_COLORS = [
  '#0EA5A4','#2563EB','#9333EA','#EA580C','#10B981','#F59E0B','#EF4444','#6366F1',
];

export const TONE_MAP = {
  edit:     { bg:'#DBEAFE', fg:'#1D4ED8', icon:'pencil-line' },
  save:     { bg:'#D1FAE5', fg:'#065F46', icon:'save' },
  export:   { bg:'#EDE9FE', fg:'#6D28D9', icon:'download' },
  create:   { bg:'#CCFBF1', fg:'#0F766E', icon:'plus' },
  system:   { bg:'#FEF3C7', fg:'#92400E', icon:'cpu' },
  lock:     { bg:'#F1F5F9', fg:'#475569', icon:'lock' },
  security: { bg:'#FEE2E2', fg:'#7F1D1D', icon:'shield' },
};

export const ELIGIBLE_TEACHER_ROLES = ['school_admin', 'advisory_teacher', 'subject_teacher'];
