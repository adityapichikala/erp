import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { NotificationsClient } from './NotificationsClient'

export default async function AdminNotificationsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD', 'TEACHER'].includes(user.role)) {
    redirect('/login')
  }

  // Fetch contextual departments and classes based on role
  let departments: any[] = []
  let classes: any[] = []

  if (user.role === 'TEACHER') {
    // Teachers only get classes they teach
    const slots = await db.timetableSlot.findMany({
      where: { course: { teacherId: user.userId } },
      select: { class: { select: { id: true, name: true } } },
      distinct: ['classId']
    })
    classes = slots.map(s => s.class).filter(Boolean)
  } else if (user.role === 'HOD') {
    // HOD gets their own department, and classes within it
    if (user.departmentId) {
      departments = await db.department.findMany({ where: { id: user.departmentId } })
      classes = await db.class.findMany({ where: { departmentId: user.departmentId } })
    }
  } else {
    // Admins get all (scoped to college if applicable)
    const collegeFilter = user.collegeId ? { collegeId: user.collegeId } : {}
    departments = await db.department.findMany({ where: collegeFilter })
    classes = await db.class.findMany({ where: user.collegeId ? { department: { collegeId: user.collegeId } } : {} })
  }

  return (
    <NotificationsClient 
      departments={departments} 
      classes={classes} 
      currentUserRole={user.role} 
    />
  )
}
