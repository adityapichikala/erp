import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

// Helper to generate a random temp password
function generateTempPassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// POST /api/admin/users/bulk - Bulk import users
export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, sessionUser) => {
  try {
    const body = await req.json()
    const { users } = body

    if (!Array.isArray(users)) {
      return NextResponse.json({ error: 'Expected an array of users' }, { status: 400 })
    }

    const results = []

    // Process sequentially to easily track successes and failures
    for (const u of users) {
      try {
        if (!u.name || !u.email || !u.role) {
          results.push({ email: u.email, status: 'failed', error: 'Missing required fields' })
          continue
        }

        const email = u.email.toLowerCase().trim()
        const existingUser = await db.user.findUnique({ where: { email } })

        if (existingUser) {
          results.push({ email, status: 'failed', error: 'Email already exists' })
          continue
        }

        const tempPassword = generateTempPassword()
        const passwordHash = await bcrypt.hash(tempPassword, 12)

        const newUser = await db.user.create({
          data: {
            name: u.name,
            email,
            role: u.role,
            departmentId: u.departmentId || null,
            collegeId: sessionUser.collegeId || undefined,
            passwordHash,
          }
        })

        results.push({
          email,
          status: 'success',
          tempPassword,
          name: newUser.name,
          role: newUser.role
        })

      } catch (err: any) {
        results.push({ email: u.email, status: 'failed', error: err.message || 'Unknown error' })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json({ error: 'Failed to process bulk import' }, { status: 500 })
  }
})
