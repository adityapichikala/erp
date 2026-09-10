import { db } from '@/lib/db'
import Link from 'next/link'

export async function TeacherDashboard({ user }: { user: any }) {
  // My Courses
  const courses = await db.course.findMany({
    where: { teacherId: user.userId },
    select: { id: true, name: true, code: true }
  })
  
  const courseIds = courses.map(c => c.id)

  // Pending Submissions to Grade
  const pendingSubmissions = await db.submission.count({
    where: {
      assignment: { courseId: { in: courseIds } },
      grade: null
    }
  })

  // Today's Timetable
  const today = new Date()
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const currentDay = dayNames[today.getDay()] as any

  const todaySlots = await db.timetableSlot.findMany({
    where: {
      courseId: { in: courseIds },
      dayOfWeek: currentDay
    },
    include: {
      course: { select: { name: true, code: true } },
      class: { select: { name: true } }
    },
    orderBy: { startTime: 'asc' }
  })

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox title="My Courses" value={courses.length.toString()} />
        <StatBox title="Pending Submissions" value={pendingSubmissions.toString()} />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Today's Schedule ({currentDay})
        </h3>
        {todaySlots.length === 0 ? (
          <div className="bg-white p-6 rounded border text-center text-gray-500">
            No classes scheduled for today.
          </div>
        ) : (
          <div className="bg-white rounded border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Room</th>
                </tr>
              </thead>
              <tbody>
                {todaySlots.map(slot => (
                  <tr key={slot.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{slot.startTime} - {slot.endTime}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{slot.course.name}</div>
                      <div className="text-xs text-gray-500">{slot.course.code}</div>
                    </td>
                    <td className="p-4 text-gray-600">{slot.class.name}</td>
                    <td className="p-4 text-gray-600">{slot.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Link href="/dashboard/teacher/assignments" className="btn-primary px-4 py-2 bg-blue-600 text-white rounded">
          Grade Assignments
        </Link>
        <Link href="/dashboard/teacher/timetable" className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700">
          Full Timetable
        </Link>
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
