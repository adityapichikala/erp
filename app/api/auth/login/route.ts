import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { signToken, SESSION_COOKIE, SessionUser } from '@/lib/auth'
import { getDashboardPath } from '@/lib/roles'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Look up user by email via Supabase REST (HTTPS — works behind firewall)
    const supabase = createServerClient()
    const { data: users, error } = await supabase
      .from('User')
      .select('id, name, email, passwordHash, role, status, collegeId, departmentId')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    if (error) {
      console.error('[POST /api/auth/login] Supabase error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const user = users?.[0] ?? null

    // Generic error — don't reveal whether email or password was wrong
    const INVALID_MSG = 'Invalid credentials. Please try again.'

    if (!user) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Contact your administrator.' },
        { status: 403 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    // Build JWT payload
    const payload: SessionUser = {
      userId:       user.id,
      role:         user.role,
      collegeId:    user.collegeId,
      departmentId: user.departmentId,
      name:         user.name,
      email:        user.email,
    }

    const token = signToken(payload)
    const dashboardPath = getDashboardPath(user.role)

    // Set httpOnly cookie and return redirect path
    const response = NextResponse.json({ redirectTo: dashboardPath }, { status: 200 })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === 'production',
      sameSite:  'lax',
      path:      '/',
      maxAge:    60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
