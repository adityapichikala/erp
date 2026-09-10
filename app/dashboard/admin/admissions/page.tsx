import { getSessionUserFromCookies } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
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

  const supabase = createServerClient()

  let admissionsQuery = supabase.from('Admission').select('*').order('createdAt', { ascending: false })
  if (status) admissionsQuery = admissionsQuery.eq('status', status)
  const { data: admissions } = await admissionsQuery

  // Fetch departments and classes for the "Convert to Student" form
  let deptsQuery = supabase.from('Department').select('id, name').order('name', { ascending: true })
  if (user.collegeId) {
    deptsQuery = deptsQuery.eq('collegeId', user.collegeId)
  }
  const { data: departments } = await deptsQuery

  const departmentIds = (departments ?? []).map(d => d.id)
  
  let classesData = []
  if (departmentIds.length > 0) {
    const { data: classes } = await supabase
      .from('Class')
      .select('id, name, departmentId')
      .in('departmentId', departmentIds)
      .order('name', { ascending: true })
    classesData = classes ?? []
  }

  return <AdmissionsClient admissions={admissions ?? []} departments={departments ?? []} classes={classesData} />
}
