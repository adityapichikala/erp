import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AdmissionsClient } from './AdmissionsClient'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function AdmissionsPage({ searchParams }: PageProps) {
  const user = await getSessionUserFromCookies()

  if (!user || !['SUPER_ADMIN', 'COLLEGE_ADMIN', 'REGISTRAR'].includes(user.role)) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const status = resolvedParams.status

  const filter: any = {}
  if (status) filter.status = status

  const admissions = await db.admission.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' }
  })

  // Fetch departments and classes for the "Convert to Student" form
  const deptFilter: any = {}
  if (user.collegeId) {
    deptFilter.collegeId = user.collegeId
  }

  const departments = await db.department.findMany({
    where: deptFilter,
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const departmentIds = departments.map(d => d.id)
  
  const classes = await db.class.findMany({
    where: { departmentId: { in: departmentIds } },
    select: { id: true, name: true, departmentId: true },
    orderBy: { name: 'asc' }
  })

  return <AdmissionsClient admissions={admissions} departments={departments} classes={classes} />
}
