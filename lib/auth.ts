import { Role } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET env var')
}

// ─── Token Payload ────────────────────────────────────────────────────────────

export interface SessionUser {
  userId:       string
  role:         Role
  collegeId:    string | null
  departmentId: string | null
  name:         string
  email:        string
}

// ─── Sign / Verify ────────────────────────────────────────────────────────────

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

// ─── Cookie name ─────────────────────────────────────────────────────────────

export const SESSION_COOKIE = 'session'

// ─── getSessionUser ───────────────────────────────────────────────────────────

/**
 * Reads and verifies the JWT from the `session` cookie on an API request.
 * Use this in Route Handlers (the request object is a NextRequest).
 *
 * For Server Components, use `getSessionUserFromCookies()` below.
 *
 * @returns Decoded SessionUser or null if missing / invalid.
 */
export function getSessionUser(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Reads and verifies the JWT from the `session` cookie in a Server Component
 * or Server Function context (where `next/headers` cookies() is available).
 *
 * Must be called in an async context:
 *   const user = await getSessionUserFromCookies()
 */
export async function getSessionUserFromCookies(): Promise<SessionUser | null> {
  // Dynamic import to avoid pulling next/headers into route handler files
  const { cookies } = await import('next/headers')
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
