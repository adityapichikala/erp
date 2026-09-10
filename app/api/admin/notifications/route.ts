import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD', 'TEACHER'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { title, body: notificationBody, targetRole, targetDepartmentId, targetClassId } = body

    if (!title || !notificationBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    // Role-based constraints
    if (user.role === 'TEACHER') {
      // Teachers can only target specific classes they teach
      if (!targetClassId) {
        return NextResponse.json({ error: 'Teachers must specify a target class' }, { status: 403 })
      }
      const slot = await db.timetableSlot.findFirst({
        where: { classId: targetClassId, course: { teacherId: user.userId } }
      })
      if (!slot) {
        return NextResponse.json({ error: 'You are not assigned to this class' }, { status: 403 })
      }
    } else if (user.role === 'HOD') {
      // HODs can only target their own department or classes within it
      if (targetDepartmentId && targetDepartmentId !== user.departmentId) {
        return NextResponse.json({ error: 'HODs can only target their own department' }, { status: 403 })
      }
      if (targetClassId) {
        const targetClass = await db.class.findUnique({ where: { id: targetClassId } })
        if (targetClass?.departmentId !== user.departmentId) {
          return NextResponse.json({ error: 'Target class is outside your department' }, { status: 403 })
        }
      }
    }

    const notification = await db.notification.create({
      data: {
        title,
        body: notificationBody,
        targetRole: targetRole || null,
        targetDepartmentId: targetDepartmentId || null,
        targetClassId: targetClassId || null,
        createdByUserId: user.userId,
        collegeId: user.collegeId
      }
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
})
