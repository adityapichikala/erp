import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TimetableViewer } from '@/app/components/TimetableViewer'

export default async function StudentTimetablePage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <TimetableViewer title="My Timetable" />
}
