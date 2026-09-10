import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FeesClient } from './FeesClient'

export default async function StudentFeesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <FeesClient />
}
