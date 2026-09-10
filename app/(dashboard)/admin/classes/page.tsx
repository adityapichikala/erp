import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ClassesClient } from './ClassesClient'

export default async function ClassesPage() {
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

  const classes = await db.class.findMany({
    where: filter,
    include: {
      department: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Calculate distinct student enrollments per class
  const classIds = classes.map(c => c.id)
  let enhancedClasses = classes.map(c => ({ ...c, studentCount: 0 }))
  
  if (classIds.length > 0) {
    const enrollments = await db.courseEnrollment.groupBy({
      by: ['classId', 'studentId'],
      where: { classId: { in: classIds } }
    })
    
    const studentCountMap = new Map<string, Set<string>>()
    for (const e of enrollments) {
      if (!studentCountMap.has(e.classId)) studentCountMap.set(e.classId, new Set())
      studentCountMap.get(e.classId)!.add(e.studentId)
    }

    enhancedClasses = classes.map(c => ({
      ...c,
      studentCount: studentCountMap.get(c.id)?.size || 0
    }))
  }

  // Fetch departments for the form
  const deptFilter: any = {}
  if (user.collegeId) deptFilter.collegeId = user.collegeId
  if (user.role === 'HOD' && user.departmentId) deptFilter.id = user.departmentId
  
  const departments = await db.department.findMany({
    where: deptFilter,
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  // Fetch active students for bulk enrollment
  const studentFilter: any = { role: 'STUDENT', status: 'ACTIVE' }
  if (user.collegeId) studentFilter.collegeId = user.collegeId
  
  const students = await db.user.findMany({
    where: studentFilter,
    select: { id: true, name: true, email: true, departmentId: true },
    orderBy: { name: 'asc' }
  })

  return <ClassesClient classes={enhancedClasses} departments={departments} students={students} />
}
