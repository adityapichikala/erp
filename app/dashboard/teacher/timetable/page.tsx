import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TimetableViewer } from '@/app/components/TimetableViewer'

export default async function TeacherTimetablePage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  return <TimetableViewer title="Teaching Schedule" />
}
