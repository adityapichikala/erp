import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

// GET: Fetch roster and existing attendance for a course on a specific date
export const GET = requireRole(['TEACHER'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const dateStr = searchParams.get('date')

  if (!courseId || !dateStr) {
    return NextResponse.json({ error: 'courseId and date are required' }, { status: 400 })
  }

  try {
    // 1. Verify Scope: Teacher MUST be the teacher of this course
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only view attendance for your own courses' }, { status: 403 })
    }

    const targetDate = new Date(dateStr)

    // 2. Fetch all enrolled students
    const enrollments = await db.courseEnrollment.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { student: { name: 'asc' } }
    })

    // 3. Fetch existing attendance records for this date
    const existingRecords = await db.attendance.findMany({
      where: {
        courseId,
        date: targetDate
      }
    })
    
    const recordMap = new Map()
    for (const rec of existingRecords) {
      recordMap.set(rec.studentId, rec.status)
    }

    // Combine roster with attendance status
    const roster = enrollments.map(e => ({
      studentId: e.student.id,
      name: e.student.name,
      email: e.student.email,
      status: recordMap.get(e.student.id) || null
    }))

    return NextResponse.json({ roster })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
  }
})

// POST: Save attendance for a course on a specific date
export const POST = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { courseId, date, records } = body // records: { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }[]

    if (!courseId || !date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    const targetDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Prevent future dates
    if (targetDate > today) {
      return NextResponse.json({ error: 'Cannot mark attendance for a future date' }, { status: 400 })
    }

    // 1. Verify Scope: Teacher MUST be the teacher of this course
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only modify attendance for your own courses' }, { status: 403 })
    }

    // Process updates in a transaction
    await db.$transaction(async (tx) => {
      for (const rec of records) {
        if (!rec.studentId || !rec.status) continue;

        // Upsert attendance record
        await tx.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: rec.studentId,
              courseId,
              date: targetDate
            }
          },
          update: { status: rec.status },
          create: {
            studentId: rec.studentId,
            courseId,
            date: targetDate,
            status: rec.status
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 })
  }
})
