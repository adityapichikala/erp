import { getSessionUserFromCookies } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AttendanceClient } from './AttendanceClient'

export default async function TeacherAttendancePage() {
  const user = await getSessionUserFromCookies()
  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  const supabase = createServerClient()

  // Fetch courses taught by the teacher
  const { data: courses } = await supabase
    .from('Course')
    .select('id, name, code')
    .eq('teacherId', user.id)

  return (
    <div className="page-container py-8">
      <h1 className="section-heading">Manage Attendance</h1>
      <AttendanceClient courses={courses || []} />
    </div>
  )
}
