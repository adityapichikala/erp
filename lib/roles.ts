import { Role } from '@prisma/client'

/**
 * Maps each role to its dashboard URL slug.
 * Keep this in sync with middleware.ts matcher rules.
 */
export const ROLE_TO_SLUG: Record<Role, string> = {
  SUPER_ADMIN:       'admin',
  COLLEGE_ADMIN:     'admin',
  HOD:               'hod',
  TEACHER:           'teacher',
  TA:                'teacher',
  STUDENT:           'student',
  REGISTRAR:         'registrar',
  FINANCE:           'finance',
  LIBRARIAN:         'librarian',
  HOSTEL_WARDEN:     'warden',
  HR:                'hr',
  PLACEMENT_OFFICER: 'placement',
  PARENT:            'parent',
}

export function getDashboardPath(role: Role): string {
  return `/dashboard/${ROLE_TO_SLUG[role]}`
}
