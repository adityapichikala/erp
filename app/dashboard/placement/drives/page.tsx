import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DrivesClient } from './DrivesClient'

export default async function PlacementDrivesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <DrivesClient />
}
