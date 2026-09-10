import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { HostelClient } from './HostelClient'

export default async function StudentHostelPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <HostelClient />
}
