import { getSessionUserFromCookies } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
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

  const supabase = createServerClient()

  let usersQuery = supabase
    .from('User')
    .select('id, name, email, role, status, departmentId, collegeId, department:departmentId(name)')
    .order('createdAt', { ascending: false })

  if (role) usersQuery = usersQuery.eq('role', role)
  if (query) {
    usersQuery = usersQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
  }
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    usersQuery = usersQuery.eq('collegeId', user.collegeId)
  }

  const { data: usersData } = await usersQuery

  const users = (usersData ?? []).map((u: any) => ({
    ...u,
    department: u.department ? { name: Array.isArray(u.department) ? u.department[0]?.name : u.department.name } : null
  }))

  // Fetch departments for the forms
  let deptQuery = supabase
    .from('Department')
    .select('id, name')
    .order('name', { ascending: true })

  if (user.collegeId) {
    deptQuery = deptQuery.eq('collegeId', user.collegeId)
  }
  
  const { data: departmentsData } = await deptQuery
  const departments = departmentsData ?? []

  return <UsersClient users={users} departments={departments} />
}
