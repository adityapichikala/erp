import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PublishResultsClient } from './PublishResultsClient'

export default async function PublishResultsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <PublishResultsClient />
}
