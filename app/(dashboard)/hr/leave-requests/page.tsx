import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LeaveRequestsClient } from './LeaveRequestsClient'

export default async function HRLeaveRequestsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['HR', 'HOD', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <LeaveRequestsClient />
}
