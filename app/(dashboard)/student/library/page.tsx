import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LibraryClient } from './LibraryClient'

export default async function StudentLibraryPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <LibraryClient />
}
