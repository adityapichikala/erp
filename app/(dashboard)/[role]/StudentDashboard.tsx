import { db } from '@/lib/db'
import Link from 'next/link'

export async function StudentDashboard({ user }: { user: any }) {
  // Attendance %
  const attendanceRecords = await db.attendance.findMany({
    where: { studentId: user.userId },
    select: { status: true }
  })
  const totalAttendance = attendanceRecords.length
  const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length
  const attendancePercent = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 100

  // Upcoming Assignment Due Dates
  const now = new Date()
  const enrollments = await db.courseEnrollment.findMany({
    where: { studentId: user.userId },
    select: { classId: true }
  })
  const classIds = enrollments.map(e => e.classId)

  // Find assignments for courses in those classes that are due in the future
  // Actually, Assignment is linked to Course. We need to find courses for those classes.
  const slots = await db.timetableSlot.findMany({
    where: { classId: { in: classIds } },
    select: { courseId: true }
  })
  const courseIds = slots.map(s => s.courseId)

  const upcomingAssignments = await db.assignment.findMany({
    where: {
      courseId: { in: courseIds },
      dueDate: { gte: now }
    },
    include: { course: { select: { name: true } } },
    orderBy: { dueDate: 'asc' },
    take: 3
  })

  // Latest Published Grade
  const latestGrade = await db.examResult.findFirst({
    where: {
      studentId: user.userId,
      publishedAt: { not: null }
    },
    include: { exam: { include: { course: true } } },
    orderBy: { publishedAt: 'desc' }
  })

  // Fee Status
  const pendingFees = await db.feeRecord.findMany({
    where: { studentId: user.userId, status: { in: ['PENDING', 'OVERDUE'] } },
    include: { feeStructure: true },
    orderBy: { feeStructure: { dueDate: 'asc' } }
  })

  const totalPendingFees = pendingFees.reduce((sum, f) => sum + f.feeStructure.amount, 0)
  const isOverdue = pendingFees.some(f => f.status === 'OVERDUE')

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox title="Overall Attendance" value={`${attendancePercent}%`} />
        
        <div className={`p-6 rounded-lg border shadow-sm flex flex-col justify-center items-center text-center ${totalPendingFees > 0 ? (isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200') : 'bg-green-50 border-green-200'}`}>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Fee Status</div>
          <div className={`text-2xl font-bold ${totalPendingFees > 0 ? (isOverdue ? 'text-red-700' : 'text-yellow-700') : 'text-green-700'}`}>
            {totalPendingFees > 0 ? `₹${totalPendingFees} Due` : 'All Paid'}
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center bg-white lg:col-span-2">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Latest Result</div>
          {latestGrade ? (
            <div className="text-center">
              <div className="font-bold text-gray-900 text-xl">{latestGrade.exam.course.name} ({latestGrade.exam.examType})</div>
              <div className="text-gray-600 mt-1">Score: {latestGrade.marksObtained} / {latestGrade.exam.maxMarks}</div>
            </div>
          ) : (
            <div className="text-gray-400">No published results yet</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded border overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
            Upcoming Assignments
          </h3>
          <Link href="/dashboard/student/assignments" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        
        {upcomingAssignments.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No upcoming assignments.</div>
        ) : (
          <div className="space-y-3">
            {upcomingAssignments.map(a => (
              <div key={a.id} className="flex justify-between items-center p-3 rounded bg-gray-50 border">
                <div>
                  <div className="font-medium text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-600">{a.course.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">{new Date(a.dueDate).toLocaleDateString()}</div>
                  <div className="text-xs text-red-500 font-medium">Due soon</div>
                </div>
              </div>
            ))}
          </div>
        )}
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
