import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { TimetableClient } from './TimetableClient'

export default async function AdminTimetablePage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'].includes(user.role)) {
    redirect('/login')
  }

  // Fetch classes
  const classFilter: any = {}
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    classFilter.department = { collegeId: user.collegeId }
  } else if (user.role === 'HOD' && user.departmentId) {
    classFilter.departmentId = user.departmentId
  }

  const classes = await db.class.findMany({
    where: classFilter,
    orderBy: { name: 'asc' }
  })

  // Fetch courses
  const courseFilter: any = {}
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    courseFilter.department = { collegeId: user.collegeId }
  } else if (user.role === 'HOD' && user.departmentId) {
    courseFilter.departmentId = user.departmentId
  }

  const courses = await db.course.findMany({
    where: courseFilter,
    orderBy: { name: 'asc' }
  })

  return <TimetableClient classes={classes} courses={courses} />
}
