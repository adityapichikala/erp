import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const { examId } = await ctx.params

    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: { course: true }
    })

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    if (exam.course.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const enrollments = await db.courseEnrollment.findMany({
      where: { courseId: exam.courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { student: { name: 'asc' } }
    })

    const existingResults = await db.examResult.findMany({
      where: { examId }
    })

    const resultMap = new Map()
    let isPublished = false
    for (const r of existingResults) {
      resultMap.set(r.studentId, r)
      if (r.publishedAt) isPublished = true
    }

    const roster = enrollments.map(e => ({
      studentId: e.studentId,
      studentName: e.student.name,
      studentEmail: e.student.email,
      result: resultMap.get(e.studentId) || null
    }))

    return NextResponse.json({ exam, roster, isPublished })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
  }
})
