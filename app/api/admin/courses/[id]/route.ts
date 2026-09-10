import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const PUT = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { name, code, departmentId, credits, teacherId } = body

    const course = await db.course.findUnique({
      where: { id },
      include: { department: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (user.role === 'COLLEGE_ADMIN' && course.department.collegeId !== user.collegeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (user.role === 'HOD' && course.departmentId !== user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name
    if (code) dataToUpdate.code = code
    if (departmentId) dataToUpdate.departmentId = departmentId
    if (credits !== undefined) dataToUpdate.credits = parseInt(credits)
    if (teacherId !== undefined) dataToUpdate.teacherId = teacherId || null

    const updatedCourse = await db.course.update({
      where: { id },
      data: dataToUpdate
    })

    return NextResponse.json({ course: updatedCourse })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Course code must be unique' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
})

export const DELETE = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params

    const course = await db.course.findUnique({
      where: { id },
      include: { department: true }
    })

    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (user.role === 'COLLEGE_ADMIN' && course.department.collegeId !== user.collegeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (user.role === 'HOD' && course.departmentId !== user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.course.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
})
