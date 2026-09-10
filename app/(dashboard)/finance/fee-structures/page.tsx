import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FeeStructuresClient } from './FeeStructuresClient'

export default async function FeeStructuresPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <FeeStructuresClient />
}
