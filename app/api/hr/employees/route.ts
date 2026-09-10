import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['HR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const filter = user.collegeId ? { user: { collegeId: user.collegeId } } : {}

    const employees = await db.employee.findMany({
      where: filter,
      include: {
        user: { select: { name: true, email: true, role: true } },
        department: { select: { name: true } }
      },
      orderBy: { user: { name: 'asc' } }
    })
    
    return NextResponse.json({ employees })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
})

export const POST = requireRole(['HR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { userId, designation, departmentId, salaryBand, joinedAt } = body

    if (!userId || !designation || !departmentId || !salaryBand || !joinedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await db.employee.findUnique({ where: { userId } })
    if (existing) {
      return NextResponse.json({ error: 'User is already an employee' }, { status: 400 })
    }

    const employee = await db.employee.create({
      data: {
        userId,
        designation,
        departmentId,
        salaryBand,
        joinedAt: new Date(joinedAt)
      }
    })

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee record' }, { status: 500 })
  }
})
