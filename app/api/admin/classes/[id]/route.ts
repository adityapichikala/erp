import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const PUT = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { name, departmentId, semester, batchYear } = body

    const classRec = await db.class.findUnique({
      where: { id },
      include: { department: true }
    })

    if (!classRec) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    if (user.role === 'COLLEGE_ADMIN' && classRec.department.collegeId !== user.collegeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (user.role === 'HOD' && classRec.departmentId !== user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name
    if (departmentId) dataToUpdate.departmentId = departmentId
    if (semester !== undefined) dataToUpdate.semester = parseInt(semester)
    if (batchYear !== undefined) dataToUpdate.batchYear = parseInt(batchYear)

    const updatedClass = await db.class.update({
      where: { id },
      data: dataToUpdate
    })

    return NextResponse.json({ class: updatedClass })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }
})

export const DELETE = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params

    const classRec = await db.class.findUnique({
      where: { id },
      include: { department: true }
    })

    if (!classRec) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (user.role === 'COLLEGE_ADMIN' && classRec.department.collegeId !== user.collegeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (user.role === 'HOD' && classRec.departmentId !== user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.class.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
})
