import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { UsersClient } from './UsersClient'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const user = await getSessionUserFromCookies()

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'COLLEGE_ADMIN')) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const role = resolvedParams.role
  const query = resolvedParams.q

  const filter: any = {}
  if (role) filter.role = role
  if (query) {
    filter.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    filter.collegeId = user.collegeId
  }

  const users = await db.user.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
      collegeId: true,
      department: { select: { name: true } }
    }
  })

  // Fetch departments for the forms
  const deptFilter: any = {}
  if (user.collegeId) {
    deptFilter.collegeId = user.collegeId
  }
  
  const departments = await db.department.findMany({
    where: deptFilter,
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return <UsersClient users={users} departments={departments} />
}
