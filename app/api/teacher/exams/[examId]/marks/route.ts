import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { computeGrade } from '@/lib/grading'

export const POST = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const { examId } = await ctx.params
    const body = await req.json()
    const { marks } = body // { studentId: string, marksObtained: number }[]

    if (!Array.isArray(marks)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: { course: true }
    })

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    if (exam.course.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if results are already published for this exam. If so, block editing.
    const existingPublishCheck = await db.examResult.findFirst({
      where: { examId, publishedAt: { not: null } }
    })

    if (existingPublishCheck) {
      return NextResponse.json({ error: 'Results are already published and cannot be modified.' }, { status: 400 })
    }

    // Process updates in transaction
    await db.$transaction(async (tx) => {
      for (const entry of marks) {
        if (entry.marksObtained < 0 || entry.marksObtained > exam.maxMarks) {
          throw new Error(`Invalid marks for student ${entry.studentId}`)
        }

        const grade = computeGrade(entry.marksObtained, exam.maxMarks)

        await tx.examResult.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: entry.studentId
            }
          },
          update: {
            marksObtained: entry.marksObtained,
            grade
          },
          create: {
            examId,
            studentId: entry.studentId,
            marksObtained: entry.marksObtained,
            grade
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Save marks error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save marks' }, { status: 500 })
  }
})
