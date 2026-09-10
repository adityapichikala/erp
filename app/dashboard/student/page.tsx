import { redirect } from 'next/navigation'
import { getSessionUserFromCookies } from '@/lib/auth'
import { StudentDashboard } from './StudentDashboard'

export default async function StudentDashboardPage() {
  const user = await getSessionUserFromCookies()
  if (!user) redirect('/login')
  if (user.role !== 'STUDENT') redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1
          className="text-3xl font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}
        >
          Dashboard Overview
        </h1>
      </div>
      <StudentDashboard user={user} />
    </div>
  )
}
