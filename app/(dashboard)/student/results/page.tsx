import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ResultsClient } from './ResultsClient'

export default async function StudentResultsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <ResultsClient />
}
