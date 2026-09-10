import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AssignmentsClient } from './AssignmentsClient'

export default async function StudentAssignmentsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <AssignmentsClient />
}
