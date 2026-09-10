import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RoomsClient } from './RoomsClient'

export default async function WardenRoomsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <RoomsClient />
}
