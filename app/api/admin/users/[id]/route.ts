import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

// PUT /api/admin/users/[id] - Update user or change status
export const PUT = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, sessionUser) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { name, email, role, departmentId, status, password } = body

    const userToUpdate = await db.user.findUnique({
      where: { id }
    })

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (sessionUser.role === 'COLLEGE_ADMIN' && userToUpdate.collegeId !== sessionUser.collegeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name
    if (email) dataToUpdate.email = email.toLowerCase().trim()
    if (role) dataToUpdate.role = role
    if (departmentId !== undefined) dataToUpdate.departmentId = departmentId || null
    if (status) dataToUpdate.status = status

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 12)
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: { select: { name: true } }
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
})
