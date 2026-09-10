import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ReportsClient } from './ReportsClient'

export default async function FinanceReportsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <ReportsClient />
}
