'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm({ dark = false }: { dark?: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Hard navigate so the session cookie is picked up by middleware
      router.push(data.redirectTo)
      router.refresh()
    } catch {
      setError('Unable to reach the server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const labelColor  = dark ? 'rgba(255,255,255,0.75)' : 'var(--color-slate)'
  const inputBg     = dark ? 'rgba(255,255,255,0.08)'  : 'var(--color-surface)'
  const inputBorder = dark ? 'rgba(255,255,255,0.2)'   : 'var(--color-border)'
  const inputColor  = dark ? '#ffffff'                  : 'var(--color-navy)'
  const inputFocus  = dark ? 'rgba(201,162,75,0.6)'     : 'var(--color-navy)'

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background:  dark ? 'rgba(239,68,68,0.15)' : '#fee2e2',
            border:      `1px solid rgba(239,68,68,${dark ? '0.4' : '1'})`,
            color:       dark ? '#fca5a5' : 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: labelColor }}
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-200"
          style={{
            background:   inputBg,
            border:       `1px solid ${inputBorder}`,
            color:        inputColor,
            backdropFilter: dark ? 'blur(4px)' : undefined,
          }}
          onFocus={e => (e.target.style.borderColor = inputFocus)}
          onBlur={e  => (e.target.style.borderColor = inputBorder)}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: labelColor }}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-200"
          style={{
            background:   inputBg,
            border:       `1px solid ${inputBorder}`,
            color:        inputColor,
            backdropFilter: dark ? 'blur(4px)' : undefined,
          }}
          onFocus={e => (e.target.style.borderColor = inputFocus)}
          onBlur={e  => (e.target.style.borderColor = inputBorder)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        id="login-submit-btn"
        className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200"
        style={{
          background:   loading
            ? 'rgba(201,162,75,0.6)'
            : 'linear-gradient(135deg, #C9A24B 0%, #a07c35 100%)',
          color:        '#fff',
          border:       'none',
          cursor:       loading ? 'not-allowed' : 'pointer',
          boxShadow:    loading ? 'none' : '0 4px 15px rgba(201,162,75,0.35)',
          letterSpacing: '0.025em',
        }}
        onMouseEnter={e => {
          if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
}
