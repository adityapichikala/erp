import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export async function TeacherDashboard({ user }: { user: any }) {
  const supabase = createServerClient()

  const { data: courses } = await supabase
    .from('Course')
    .select('id, name, enrollments:CourseEnrollment(count), assignments:Assignment(count)')
    .eq('teacherId', user.id)

  const { count: assignmentsDue } = await supabase
    .from('Assignment')
    .select('*', { count: 'exact', head: true })
    .eq('teacherId', user.id)
    .gte('dueDate', new Date().toISOString())

  const totalStudents = (courses ?? []).reduce((s: number, c: any) => {
    const cnt = Array.isArray(c.enrollments) ? c.enrollments[0]?.count ?? 0 : 0
    return s + Number(cnt)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatBox title="My Courses" value={(courses?.length ?? 0).toString()} />
        <StatBox title="Active Assignments" value={(assignmentsDue ?? 0).toString()} />
        <StatBox title="Total Students" value={totalStudents.toString()} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Assignments', href: '/dashboard/teacher/assignments' },
          { label: 'Attendance',  href: '/dashboard/teacher/attendance' },
          { label: 'Marks Entry', href: '/dashboard/teacher/marks-entry' },
          { label: 'Timetable',   href: '/dashboard/teacher/timetable' },
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

function StatBox({ title, value }: { title: string; value: string }) {
  return (
    <div
      className="bg-white p-6 rounded-xl border flex flex-col justify-center items-center text-center"
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
}
