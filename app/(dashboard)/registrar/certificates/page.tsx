import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CertificatesClient } from './CertificatesClient'

export default async function RegistrarCertificatesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  // Fetch students for the dropdown
  const filter = user.collegeId ? { collegeId: user.collegeId } : {}
  const students = await db.user.findMany({
    where: { role: 'STUDENT', ...filter },
    select: { id: true, name: true, email: true, department: { select: { name: true } } },
    orderBy: { name: 'asc' }
  })

  return <CertificatesClient students={students} />
}
