import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ExamsClient } from './ExamsClient'

export default async function RegistrarExamsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  // Fetch all courses for the dropdown
  const filter: any = {}
  if (user.collegeId) filter.department = { collegeId: user.collegeId }

  const courses = await db.course.findMany({
    where: filter,
    select: { id: true, name: true, code: true, department: { select: { name: true } } },
    orderBy: { name: 'asc' }
  })

  return <ExamsClient courses={courses} />
}
