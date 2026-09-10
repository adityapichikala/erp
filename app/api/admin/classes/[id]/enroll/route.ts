import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const { id: classId } = await ctx.params
    const body = await req.json()
    const { studentIds } = body

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Please select at least one student' }, { status: 400 })
    }

    const classRec = await db.class.findUnique({
      where: { id: classId },
      include: { department: true }
    })

    if (!classRec) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    if (user.role === 'COLLEGE_ADMIN' && classRec.department.collegeId !== user.collegeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (user.role === 'HOD' && classRec.departmentId !== user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find all courses associated with this class via TimetableSlots
    const slots = await db.timetableSlot.findMany({
      where: { classId },
      select: { courseId: true },
      distinct: ['courseId']
    })

    const courseIds = slots.map(s => s.courseId)

    if (courseIds.length === 0) {
      return NextResponse.json({ 
        error: 'This class has no courses assigned to it yet. Please create timetable slots for this class first so we know which courses to enroll the students in.' 
      }, { status: 400 })
    }

    // Build the bulk enrollment data
    const enrollments = []
    for (const studentId of studentIds) {
      for (const courseId of courseIds) {
        enrollments.push({
          studentId,
          courseId,
          classId
        })
      }
    }

    // Use createMany with skipDuplicates so it doesn't fail if they are already enrolled
    const result = await db.courseEnrollment.createMany({
      data: enrollments,
      skipDuplicates: true
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error('Error in bulk enrollment', error)
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 })
  }
})
