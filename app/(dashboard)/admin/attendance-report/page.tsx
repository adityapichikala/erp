import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AttendanceReportClient } from './AttendanceReportClient'

export default async function AttendanceReportPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'].includes(user.role)) {
    redirect('/login')
  }

  // Fetch departments for the filter
  const deptFilter: any = {}
  if (user.collegeId) deptFilter.collegeId = user.collegeId
  if (user.role === 'HOD' && user.departmentId) deptFilter.id = user.departmentId
  
  const departments = await db.department.findMany({
    where: deptFilter,
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return <AttendanceReportClient departments={departments} />
}
