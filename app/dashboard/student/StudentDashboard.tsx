import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { MegaMenu } from './MegaMenu'

export async function StudentDashboard({ user }: { user: any }) {
  const supabase = createServerClient()

  // Enrolled courses
  const { data: enrollments } = await supabase
    .from('CourseEnrollment')
    .select('id, course:courseId(name, teacher:teacherId(name))')
    .eq('studentId', user.id)

  // Attendance summary
  const { data: attendance } = await supabase
    .from('Attendance')
    .select('status')
    .eq('studentId', user.id)

  const totalClasses = attendance?.length ?? 0
  const presentCount = (attendance ?? []).filter((a: any) => a.status === 'PRESENT').length
  const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

  // Fee status
  const { data: feeRecords } = await supabase
    .from('FeeRecord')
    .select('status')
    .eq('studentId', user.id)

  const pendingFees = (feeRecords ?? []).filter((f: any) => f.status === 'PENDING' || f.status === 'OVERDUE')

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatBox title="Enrolled Courses" value={(enrollments?.length ?? 0).toString()} />
        <StatBox
          title="Overall Attendance"
          value={`${attendancePct}%`}
          warning={attendancePct > 0 && attendancePct < 75}
        />
        <StatBox
          title="Fee Status"
          value={pendingFees.length > 0 ? 'Due' : 'Cleared'}
          warning={pendingFees.length > 0}
        />
      </div>

      {/* Mega Menu Navigation */}
      <MegaMenu />
    </div>
  )
}

function StatBox({ title, value, warning }: { title: string; value: string; warning?: boolean }) {
  return (
    <div
      className="bg-white p-6 rounded-xl border flex flex-col justify-center items-center text-center"
      style={{ borderColor: warning ? '#ef4444' : 'var(--color-border)' }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>
        {title}
      </div>
      <div className="text-3xl font-bold" style={{ color: warning ? '#ef4444' : 'var(--color-navy)' }}>
        {value}
      </div>
    </div>
  )
}
