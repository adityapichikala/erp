import { createServerClient } from '@/lib/supabase-server'

export async function HODDashboard({ user }: { user: any }) {
  const supabase = createServerClient()
  const deptId = user.departmentId

  const { count: totalStudents } = await supabase
    .from('User')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'STUDENT')
    .eq('departmentId', deptId)

  const { count: totalTeachers } = await supabase
    .from('User')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'TEACHER')
    .eq('departmentId', deptId)

  const { count: totalCourses } = await supabase
    .from('Course')
    .select('*', { count: 'exact', head: true })
    .eq('departmentId', deptId)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatBox title="Students" value={(totalStudents ?? 0).toString()} />
      <StatBox title="Teachers" value={(totalTeachers ?? 0).toString()} />
      <StatBox title="Courses"  value={(totalCourses  ?? 0).toString()} />
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
