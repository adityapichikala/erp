import { redirect } from 'next/navigation'
import { getSessionUserFromCookies } from '@/lib/auth'
import { HODDashboard } from './HODDashboard'

export default async function HODDashboardPage() {
  const user = await getSessionUserFromCookies()
  if (!user) redirect('/login')
  if (user.role !== 'HOD') redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-3xl font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          HOD Dashboard
        </h1>
      </div>
      <HODDashboard user={user} />
    </div>
  )
}
