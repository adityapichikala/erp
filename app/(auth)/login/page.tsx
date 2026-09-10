import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to the University ERP system',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-off-white)' }}
    >
      <div className="w-full max-w-sm">

        {/* Institution mark */}
        <div className="mb-8 text-center">
          <span className="badge-gold inline-block mb-4">University ERP</span>
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-slate)' }}>
            Sign in with your institutional email
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded px-8 py-8"
          style={{
            background:  'var(--color-surface)',
            border:      '1px solid var(--color-border)',
          }}
        >
          <LoginForm />
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-slate)' }}>
          Having trouble signing in? Contact your system administrator.
        </p>
      </div>
    </main>
  )
}
