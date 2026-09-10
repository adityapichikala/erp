import { redirect } from 'next/navigation'
import { getSessionUserFromCookies } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getSessionUserFromCookies()
  if (!user) redirect('/login')
  if (user.role !== 'HR') redirect('/login')

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-slate)' }}>
          Welcome back, {user.name}
        </p>
      </div>
      <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-lg font-medium" style={{ color: 'var(--color-navy)' }}>
          {user.role.replace(/_/g, ' ')} Portal
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-slate)' }}>
          Use the navigation on the left to get started.
        </p>
      </div>
    </div>
  )
}
