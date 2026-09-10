import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const { id: assignmentId } = await ctx.params

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    if (assignment.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all students enrolled in the course this assignment belongs to
    const enrollments = await db.courseEnrollment.findMany({
      where: { courseId: assignment.courseId },
      include: {
        student: { select: { id: true, name: true, email: true } }
      }
    })

    // Get all submissions for this assignment
    const submissions = await db.submission.findMany({
      where: { assignmentId },
      include: {
        grade: true
      },
      orderBy: { submittedAt: 'desc' }
    })

    // Map the latest submission per student
    const studentSubmissions = new Map()
    for (const sub of submissions) {
      if (!studentSubmissions.has(sub.studentId)) {
        studentSubmissions.set(sub.studentId, sub)
      } else {
        // Since we ordered by submittedAt desc, the first one we hit is the latest.
        // Wait, version is better to compare if there are multiple.
        const existing = studentSubmissions.get(sub.studentId)
        if (sub.version > existing.version) {
          studentSubmissions.set(sub.studentId, sub)
        }
      }
    }

    // Build the final list: Student + their latest submission (if any)
    const list = enrollments.map(e => {
      const sub = studentSubmissions.get(e.studentId)
      return {
        studentId: e.studentId,
        studentName: e.student.name,
        studentEmail: e.student.email,
        submission: sub || null
      }
    })

    // Sort: Needs grading first, then graded, then not submitted
    list.sort((a, b) => {
      if (a.submission && !b.submission) return -1
      if (!a.submission && b.submission) return 1
      if (a.submission && b.submission) {
        if (!a.submission.grade && b.submission.grade) return -1
        if (a.submission.grade && !b.submission.grade) return 1
      }
      return a.studentName.localeCompare(b.studentName)
    })

    return NextResponse.json({ list })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
})
