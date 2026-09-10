import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get('departmentId')

  const filter: any = {}
  if (departmentId) filter.departmentId = departmentId
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    filter.department = { collegeId: user.collegeId }
  } else if (user.role === 'HOD' && user.departmentId) {
    filter.departmentId = user.departmentId
  }

  try {
    const courses = await db.course.findMany({
      where: filter,
      include: {
        department: { select: { name: true } },
        teacher: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ courses })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
})

export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { name, code, departmentId, credits, teacherId } = body

    if (!name || !code || !departmentId) {
      return NextResponse.json({ error: 'Name, code, and department are required' }, { status: 400 })
    }

    if (user.role === 'HOD' && user.departmentId !== departmentId) {
      return NextResponse.json({ error: 'HOD can only create courses in their department' }, { status: 403 })
    }

    const newCourse = await db.course.create({
      data: {
        name,
        code,
        departmentId,
        credits: parseInt(credits) || 3,
        teacherId: teacherId || null
      }
    })

    return NextResponse.json({ course: newCourse }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Course code must be unique' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
})
