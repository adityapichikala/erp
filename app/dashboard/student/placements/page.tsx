import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StudentPlacementsClient } from './StudentPlacementsClient'

export default async function StudentPlacementsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <StudentPlacementsClient />
}
