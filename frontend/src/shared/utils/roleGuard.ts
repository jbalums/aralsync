import type { User, UserRole } from '../types';

const ROLE_RANK: Record<UserRole, number> = {
  subject_teacher:  1,
  advisory_teacher: 2,
  school_admin:     3,
  super_admin:      4,
};

export function hasRole(user: User | null, minRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_RANK[user.role] >= ROLE_RANK[minRole];
}
