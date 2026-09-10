import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StudentCertificatesClient } from './StudentCertificatesClient'

export default async function StudentCertificatesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <StudentCertificatesClient />
}
