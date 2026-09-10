import { redirect } from 'next/navigation'
import { getSessionUserFromCookies } from '@/lib/auth'
import { ROLE_TO_SLUG } from '@/lib/roles'
import { AdminDashboard } from './AdminDashboard'
import { HODDashboard } from './HODDashboard'
import { TeacherDashboard } from './TeacherDashboard'
import { StudentDashboard } from './StudentDashboard'

interface Props {
  params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { role } = await params
  const user = await getSessionUserFromCookies()

  if (!user) {
    redirect('/login')
  }

  const correctSlug = ROLE_TO_SLUG[user.role]
  if (role !== correctSlug) {
    redirect(`/dashboard/${correctSlug}`)
  }

  let DashboardContent = null

  if (user.role === 'SUPER_ADMIN' || user.role === 'COLLEGE_ADMIN') {
    DashboardContent = <AdminDashboard user={user} />
  } else if (user.role === 'HOD') {
    DashboardContent = <HODDashboard user={user} />
  } else if (user.role === 'TEACHER') {
    DashboardContent = <TeacherDashboard user={user} />
  } else if (user.role === 'STUDENT') {
    DashboardContent = <StudentDashboard user={user} />
  } else {
    // Fallback for other roles (HR, PARENT, etc)
    DashboardContent = (
      <div className="bg-white rounded p-6 border shadow-sm text-center text-gray-500">
        Dashboard coming soon for {user.role.replace(/_/g, ' ')}.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Dashboard Overview
        </h1>
      </div>

      {DashboardContent}
    </div>
  )
}
