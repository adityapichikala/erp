import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

// Check if two time ranges overlap
// Assumes strict "HH:MM" 24h format
function timesOverlap(start1: string, end1: string, start2: string, end2: string) {
  return start1 < end2 && start2 < end1
}

export const GET = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const classId = searchParams.get('classId')

  if (!classId) return NextResponse.json({ error: 'classId is required' }, { status: 400 })

  try {
    const slots = await db.timetableSlot.findMany({
      where: { classId },
      include: {
        course: {
          select: { name: true, code: true, teacherId: true, teacher: { select: { name: true } } }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })
    return NextResponse.json({ slots })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 })
  }
})

export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { courseId, classId, dayOfWeek, startTime, endTime, room } = body

    if (!courseId || !classId || dayOfWeek === undefined || !startTime || !endTime || !room) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (startTime >= endTime) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
    }

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    // 1. Room Conflict
    const roomConflicts = await db.timetableSlot.findMany({
      where: {
        dayOfWeek: parseInt(dayOfWeek),
        room,
        // Check college boundaries if applicable. For now, strict room overlap.
      }
    })

    const hasRoomConflict = roomConflicts.some(slot => 
      timesOverlap(startTime, endTime, slot.startTime, slot.endTime)
    )

    if (hasRoomConflict) {
      return NextResponse.json({ error: 'Room is already booked for this time' }, { status: 409 })
    }

    // 2. Teacher Conflict
    if (course.teacherId) {
      // Find all slots this teacher is teaching on the same day
      const teacherSlots = await db.timetableSlot.findMany({
        where: {
          dayOfWeek: parseInt(dayOfWeek),
          course: { teacherId: course.teacherId }
        },
        include: { class: true }
      })

      const hasTeacherConflict = teacherSlots.some(slot => 
        timesOverlap(startTime, endTime, slot.startTime, slot.endTime)
      )

      if (hasTeacherConflict) {
        return NextResponse.json({ error: 'Teacher is already scheduled for another class at this time' }, { status: 409 })
      }
    }

    const newSlot = await db.timetableSlot.create({
      data: {
        courseId,
        classId,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        room
      },
      include: {
        course: { select: { name: true, code: true, teacher: { select: { name: true } } } }
      }
    })

    return NextResponse.json({ slot: newSlot }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create timetable slot' }, { status: 500 })
  }
})
