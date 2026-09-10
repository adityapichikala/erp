import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AttendanceMarker } from './AttendanceMarker'

export default async function TeacherAttendancePage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  // Fetch courses assigned to this teacher
  const courses = await db.course.findMany({
    where: { teacherId: user.userId },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' }
  })

  return <AttendanceMarker courses={courses} />
}
