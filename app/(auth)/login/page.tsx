import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — Global Tech University ERP',
  description: 'Sign in to the University ERP system',
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/university-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(18,33,60,0.85) 0%, rgba(18,33,60,0.65) 100%)' }}
      />

      {/* Decorative blurred orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A24B, transparent)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A24B, transparent)' }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">

        {/* Institution branding */}
        <div className="mb-8 text-center">
          {/* Emblem / Logo mark */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #C9A24B, #a07c35)',
                boxShadow: '0 4px 20px rgba(201,162,75,0.4)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3L2 10l14 7 14-7-14-7z" fill="white" opacity="0.95"/>
                <path d="M2 10v8l14 7 14-7v-8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <circle cx="16" cy="10" r="2.5" fill="white"/>
              </svg>
            </div>
          </div>

          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-2"
            style={{ color: '#C9A24B' }}
          >
            Global Tech University
          </p>
          <h1
            className="text-3xl font-semibold text-white"
            style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Sign in with your institutional credentials
          </p>
        </div>

        {/* Glassmorphism card */}
        <div
          className="rounded-2xl px-8 py-8"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <LoginForm dark />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} Global Tech University. All rights reserved.{' '}
          <br />
          Having trouble? Contact your system administrator.
        </p>
      </div>
    </main>
  )
}
