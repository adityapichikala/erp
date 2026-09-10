import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ApplicationsClient } from './ApplicationsClient'

export default async function PlacementApplicationsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <ApplicationsClient />
}
