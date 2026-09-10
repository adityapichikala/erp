import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CoursesClient } from './CoursesClient'

export default async function CoursesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'].includes(user.role)) {
    redirect('/login')
  }

  const filter: any = {}
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    filter.department = { collegeId: user.collegeId }
  } else if (user.role === 'HOD' && user.departmentId) {
    filter.departmentId = user.departmentId
  }

  const courses = await db.course.findMany({
    where: filter,
    include: {
      department: { select: { name: true } },
      teacher: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch departments for the form
  const deptFilter: any = {}
  if (user.collegeId) deptFilter.collegeId = user.collegeId
  if (user.role === 'HOD' && user.departmentId) deptFilter.id = user.departmentId
  
  const departments = await db.department.findMany({
    where: deptFilter,
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  // Fetch teachers to assign to courses
  const teachers = await db.user.findMany({
    where: { 
      role: 'TEACHER', 
      status: 'ACTIVE',
      ...(user.collegeId ? { collegeId: user.collegeId } : {}) 
    },
    select: { id: true, name: true, departmentId: true },
    orderBy: { name: 'asc' }
  })

  return <CoursesClient courses={courses} departments={departments} teachers={teachers} />
}
