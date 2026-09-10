import { getSessionUserFromCookies } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function StudentAttendancePage() {
  const user = await getSessionUserFromCookies()
  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  const supabase = createServerClient()

  const { data: attendanceRecords } = await supabase
    .from('Attendance')
    .select('id, date, status, course:courseId(name, code)')
    .eq('studentId', user.id)
    .order('date', { ascending: false })

  const totalClasses = attendanceRecords?.length ?? 0
  const presentCount = (attendanceRecords ?? []).filter((a: any) => a.status === 'PRESENT').length
  const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

  return (
    <div className="page-container py-8 space-y-6">
      <h1 className="section-heading">My Attendance</h1>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy)' }}>Overall Attendance</h2>
          <p className="text-sm" style={{ color: 'var(--color-slate)' }}>Total classes held: {totalClasses}</p>
        </div>
        <div className={`text-4xl font-bold ${attendancePct < 75 ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>
          {attendancePct}%
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Code</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(attendanceRecords ?? []).map((record: any) => (
              <tr key={record.id}>
                <td className="font-mono text-sm">{record.date}</td>
                <td className="font-medium">{record.course?.name || 'Unknown'}</td>
                <td className="font-mono text-sm">{record.course?.code || 'N/A'}</td>
                <td>
                  {record.status === 'PRESENT' && <span className="badge-success">Present</span>}
                  {record.status === 'LATE' && <span className="badge-warning">Late</span>}
                  {record.status === 'ABSENT' && <span className="badge-error">Absent</span>}
                </td>
              </tr>
            ))}
            {totalClasses === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
