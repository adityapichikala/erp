import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'
import { ROLE_TO_SLUG } from '@/lib/roles'

// Routes that require authentication
const PROTECTED_PATTERN = /^\/dashboard(\/.*)?$/

// Routes that authenticated users should leave
const AUTH_ONLY_PATTERN = /^\/login$/

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const user = token ? verifyToken(token) : null

  // ── Authenticated user on /login → redirect to their dashboard ────────────
  if (AUTH_ONLY_PATTERN.test(pathname) && user) {
    const slug = ROLE_TO_SLUG[user.role]
    return NextResponse.redirect(new URL(`/dashboard/${slug}`, req.url))
  }

  // ── Unauthenticated user on protected route → redirect to /login ──────────
  if (PROTECTED_PATTERN.test(pathname) && !user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
}
