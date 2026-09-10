'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ROLE_NAV = {
  SUPER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Admissions', href: '/dashboard/admin/admissions' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Courses', href: '/dashboard/admin/courses' },
    { label: 'Timetable', href: '/dashboard/admin/timetable' },
    { label: 'Attendance', href: '/dashboard/admin/attendance-report' },
    { label: 'Notifications', href: '/dashboard/admin/notifications' },
  ],
  COLLEGE_ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Admissions', href: '/dashboard/admin/admissions' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Courses', href: '/dashboard/admin/courses' },
    { label: 'Timetable', href: '/dashboard/admin/timetable' },
    { label: 'Attendance', href: '/dashboard/admin/attendance-report' },
    { label: 'Notifications', href: '/dashboard/admin/notifications' },
  ],
  HOD: [
    { label: 'Dashboard', href: '/dashboard/hod' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Courses', href: '/dashboard/admin/courses' },
    { label: 'Timetable', href: '/dashboard/admin/timetable' },
    { label: 'Notifications', href: '/dashboard/admin/notifications' },
    { label: 'Leave Requests', href: '/dashboard/hr/leave-requests' },
  ],
  TEACHER: [
    { label: 'Dashboard', href: '/dashboard/teacher' },
    { label: 'Assignments', href: '/dashboard/teacher/assignments' },
    { label: 'Attendance Entry', href: '/dashboard/teacher/attendance' },
    { label: 'Marks Entry', href: '/dashboard/teacher/marks-entry' },
    { label: 'Timetable', href: '/dashboard/teacher/timetable' },
    { label: 'Notifications', href: '/dashboard/admin/notifications' },
    { label: 'My Leave', href: '/dashboard/staff/leave' },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/dashboard/student' },
    { label: 'Assignments', href: '/dashboard/student/assignments' },
    { label: 'Attendance', href: '/dashboard/student/attendance' },
    { label: 'Timetable', href: '/dashboard/student/timetable' },
    { label: 'Results', href: '/dashboard/student/results' },
    { label: 'Fees', href: '/dashboard/student/fees' },
    { label: 'Library', href: '/dashboard/student/library' },
    { label: 'Hostel', href: '/dashboard/student/hostel' },
    { label: 'Placements', href: '/dashboard/student/placements' },
    { label: 'Certificates', href: '/dashboard/student/certificates' },
  ],
  REGISTRAR: [
    { label: 'Dashboard', href: '/dashboard/registrar' },
    { label: 'Admissions', href: '/dashboard/admin/admissions' },
    { label: 'Exams', href: '/dashboard/registrar/exams' },
    { label: 'Results Approval', href: '/dashboard/registrar/results' },
    { label: 'Certificates', href: '/dashboard/registrar/certificates' },
  ],
  FINANCE: [
    { label: 'Dashboard', href: '/dashboard/finance' },
    { label: 'Fee Structures', href: '/dashboard/finance/fee-structures' },
    { label: 'Fee Records', href: '/dashboard/finance/records' },
    { label: 'Reports', href: '/dashboard/finance/reports' },
  ],
  HR: [
    { label: 'Dashboard', href: '/dashboard/hr' },
    { label: 'Employees', href: '/dashboard/hr/employees' },
    { label: 'Leave Requests', href: '/dashboard/hr/leave-requests' },
  ],
  LIBRARIAN: [
    { label: 'Dashboard', href: '/dashboard/librarian' },
    { label: 'Catalog', href: '/dashboard/librarian/catalog' },
    { label: 'Issues & Returns', href: '/dashboard/librarian/issues' },
  ],
  HOSTEL_WARDEN: [
    { label: 'Dashboard', href: '/dashboard/warden' },
    { label: 'Rooms', href: '/dashboard/warden/rooms' },
    { label: 'Allocations', href: '/dashboard/warden/allocations' },
  ],
  PLACEMENT_OFFICER: [
    { label: 'Dashboard', href: '/dashboard/placement' },
    { label: 'Drives', href: '/dashboard/placement/drives' },
    { label: 'Applications', href: '/dashboard/placement/applications' },
  ],
  PARENT: [
    { label: 'Dashboard', href: '/dashboard/parent' },
  ]
}

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const links = ROLE_NAV[role as keyof typeof ROLE_NAV] || []

  return (
    <aside className="w-64 bg-white border-r flex flex-col hidden md:flex sticky top-0 h-screen" style={{ borderColor: 'var(--color-border)' }}>
      <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <span className="badge-gold">University ERP</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== `/dashboard/${role.toLowerCase()}`)
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
