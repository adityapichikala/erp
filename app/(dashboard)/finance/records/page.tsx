import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FeeRecordsClient } from './FeeRecordsClient'

export default async function FeeRecordsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <FeeRecordsClient />
}
