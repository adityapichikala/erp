import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AttendanceViewer } from './AttendanceViewer'

export default async function StudentAttendancePage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  return <AttendanceViewer />
}
