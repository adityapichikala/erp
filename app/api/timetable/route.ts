import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let slots: any[] = []

    if (user.role === 'STUDENT') {
      // Find classes the student is enrolled in
      const enrollments = await db.courseEnrollment.findMany({
        where: { studentId: user.userId },
        select: { classId: true },
        distinct: ['classId']
      })
      const classIds = enrollments.map(e => e.classId)

      slots = await db.timetableSlot.findMany({
        where: { classId: { in: classIds } },
        include: {
          course: { select: { name: true, code: true, teacher: { select: { name: true } } } },
          class: { select: { name: true } }
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      })
    } else if (user.role === 'TEACHER') {
      // Find slots for courses the teacher is teaching
      slots = await db.timetableSlot.findMany({
        where: { course: { teacherId: user.userId } },
        include: {
          course: { select: { name: true, code: true } },
          class: { select: { name: true } }
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      })
    } else {
      return NextResponse.json({ error: 'Role not supported for this view' }, { status: 403 })
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Timetable fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 })
  }
}
