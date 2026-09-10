import { db } from '@/lib/db'

export async function HODDashboard({ user }: { user: any }) {
  const deptFilter = { departmentId: user.departmentId }

  // Total Students
  const totalStudents = await db.user.count({
    where: { role: 'STUDENT', ...deptFilter }
  })

  // Total Staff
  const totalStaff = await db.user.count({
    where: { role: { notIn: ['STUDENT', 'PARENT'] }, ...deptFilter }
  })

  // Attendance %
  const attendanceRecords = await db.attendance.findMany({
    where: { student: { departmentId: user.departmentId } },
    select: { status: true }
  })
  const totalAttendance = attendanceRecords.length
  const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length
  const attendancePercent = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
        Department Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox title="Department Students" value={totalStudents.toString()} />
        <StatBox title="Department Staff" value={totalStaff.toString()} />
        <StatBox title="Avg Attendance" value={`${attendancePercent}%`} />
      </div>
    </div>
  )
}

function StatBox({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</div>
      <div className="text-3xl font-bold" style={{ color: 'var(--color-navy)' }}>{value}</div>
    </div>
  )
}
