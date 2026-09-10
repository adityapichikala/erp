import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

// GET /api/admin/users - List users
export const GET = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const query = searchParams.get('q')

  const filter: any = {}
  
  if (role) {
    filter.role = role
  }

  if (query) {
    filter.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ]
  }

  // College admins can only see users in their college. Super Admins see all.
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    filter.collegeId = user.collegeId
  }

  try {
    const users = await db.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        collegeId: true,
        department: {
          select: { name: true }
        }
      }
    })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
})

// POST /api/admin/users - Create user
export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { name, email, role, departmentId, password } = body

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const collegeId = user.collegeId || undefined

    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        departmentId: departmentId || null,
        collegeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: { select: { name: true } }
      }
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
})
