import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from './LogoutButton'
import { NotificationBell } from '@/app/components/NotificationBell'
import { Sidebar } from '@/app/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUserFromCookies()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ background: 'var(--color-off-white)' }}>
      {/* Left Sidebar (Desktop) */}
      <Sidebar role={user.role} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top Navigation Bar */}
        <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: 'var(--color-border)' }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile hamburger placeholder (for future full mobile support) */}
              <div className="flex items-center md:hidden">
                <span className="badge-gold">ERP</span>
              </div>
              <div className="hidden md:block">
                {/* Space for breadcrumbs or page title if needed */}
              </div>
              
              <div className="flex items-center space-x-6 ml-auto">
                <div className="hidden sm:flex items-center space-x-2 text-right">
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>
                    {user.name}
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold uppercase tracking-widest">
                    {user.role.replace(/_/g, ' ')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 border-l pl-4" style={{ borderColor: 'var(--color-border)' }}>
                  <NotificationBell />
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
