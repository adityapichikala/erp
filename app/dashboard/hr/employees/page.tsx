import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { EmployeesClient } from './EmployeesClient'

export default async function HREmployeesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['HR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  // Get users who are non-students (staff roles)
  const users = await db.user.findMany({
    where: { 
      role: { not: 'STUDENT' },
      ...(user.collegeId ? { collegeId: user.collegeId } : {})
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' }
  })

  // Get departments
  const departments = await db.department.findMany({
    where: user.collegeId ? { collegeId: user.collegeId } : {},
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return <EmployeesClient users={users} departments={departments} />
}
