import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AssignmentsClient } from './AssignmentsClient'

export default async function TeacherAssignmentsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  // Fetch courses taught by this teacher for the dropdown
  const courses = await db.course.findMany({
    where: { teacherId: user.userId },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' }
  })

  return <AssignmentsClient courses={courses} />
}
