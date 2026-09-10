import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export async function AdminDashboard({ user }: { user: any }) {
  const supabase = createServerClient()

  // Total Students
  const { count: totalStudents } = await supabase
    .from('User')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'STUDENT')
    .eq('collegeId', user.collegeId)

  // Total Staff (not students or parents)
  const { count: totalStaff } = await supabase
    .from('User')
    .select('*', { count: 'exact', head: true })
    .not('role', 'in', '("STUDENT","PARENT")')
    .eq('collegeId', user.collegeId)

  // Pending Admissions
  const { count: pendingAdmissions } = await supabase
    .from('Admission')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  // Fee collection
  const { data: feeRecords } = await supabase
    .from('FeeRecord')
    .select('status, amountPaid, feeStructure:feeStructureId(amount)')

  const totalDue = (feeRecords ?? []).reduce((s: number, f: any) => s + (f.feeStructure?.amount ?? 0), 0)
  const totalCollected = (feeRecords ?? [])
    .filter((f: any) => f.status === 'PAID')
    .reduce((s: number, f: any) => s + (f.feeStructure?.amount ?? 0), 0)
  const feeCollectionPercent = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0

  // Attendance
  const { data: attendanceRecords } = await supabase
    .from('Attendance')
    .select('status')
  const totalAttendance = attendanceRecords?.length ?? 0
  const totalPresent = (attendanceRecords ?? []).filter((a: any) => a.status === 'PRESENT').length
  const attendancePercent = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0

  const stats = [
    { title: 'Total Students',     value: (totalStudents ?? 0).toString(),   href: '/dashboard/admin/users' },
    { title: 'Total Staff',        value: (totalStaff ?? 0).toString(),      href: '/dashboard/admin/users' },
    { title: 'Fee Collection',     value: `${feeCollectionPercent}%`,        href: null },
    { title: 'Avg Attendance',     value: `${attendancePercent}%`,           href: '/dashboard/admin/attendance-report' },
    { title: 'Pending Admissions', value: (pendingAdmissions ?? 0).toString(), href: '/dashboard/admin/admissions' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatBox key={s.title} title={s.title} value={s.value} href={s.href} />
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { label: 'Manage Users',      href: '/dashboard/admin/users' },
          { label: 'Admissions',        href: '/dashboard/admin/admissions' },
          { label: 'Courses',           href: '/dashboard/admin/courses' },
          { label: 'Timetable',         href: '/dashboard/admin/timetable' },
          { label: 'Classes',           href: '/dashboard/admin/classes' },
          { label: 'Notifications',     href: '/dashboard/admin/notifications' },
          { label: 'Attendance Report', href: '/dashboard/admin/attendance-report' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--color-navy)', color: '#fff' }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatBox({ title, value, href }: { title: string; value: string; href: string | null }) {
  const inner = (
    <div
      className="bg-white p-6 rounded-xl border flex flex-col justify-center items-center text-center transition-all hover:shadow-md"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>
        {title}
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--color-navy)' }}>
        {value}
      </div>
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}
