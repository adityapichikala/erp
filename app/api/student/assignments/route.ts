import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    // Get courses the student is enrolled in
    const enrollments = await db.courseEnrollment.findMany({
      where: { studentId: user.userId },
      select: { courseId: true }
    })
    const courseIds = enrollments.map(e => e.courseId)

    // Get assignments for those courses
    const assignments = await db.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { name: true, code: true, teacher: { select: { name: true } } } },
        submissions: {
          where: { studentId: user.userId },
          orderBy: { version: 'desc' },
          take: 1, // Only get the latest submission
          include: { grade: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
})
