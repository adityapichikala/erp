import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const { submissionId } = await ctx.params
    const body = await req.json()
    const { score, feedback } = body

    if (score === undefined) {
      return NextResponse.json({ error: 'Score is required' }, { status: 400 })
    }

    // Fetch submission and verify teacher teaches the course
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { courseId: true, maxMarks: true } },
        grade: true
      }
    })

    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

    const course = await db.course.findUnique({ where: { id: submission.assignment.courseId } })
    if (!course || course.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (parseFloat(score) > submission.assignment.maxMarks || parseFloat(score) < 0) {
      return NextResponse.json({ error: `Score must be between 0 and ${submission.assignment.maxMarks}` }, { status: 400 })
    }

    let updatedGrade

    if (submission.grade) {
      // Edit existing grade, log history
      const historyArr: any[] = Array.isArray(submission.grade.history) ? submission.grade.history : []
      historyArr.push({
        score: submission.grade.score,
        feedback: submission.grade.feedback,
        gradedByUserId: submission.grade.gradedByUserId,
        gradedAt: submission.grade.gradedAt
      })

      updatedGrade = await db.grade.update({
        where: { id: submission.grade.id },
        data: {
          score: parseFloat(score),
          feedback: feedback || null,
          gradedByUserId: user.userId,
          gradedAt: new Date(),
          history: historyArr
        }
      })
    } else {
      // Create new grade
      updatedGrade = await db.grade.create({
        data: {
          submissionId,
          score: parseFloat(score),
          feedback: feedback || null,
          gradedByUserId: user.userId,
          history: []
        }
      })
    }

    return NextResponse.json({ success: true, grade: updatedGrade })
  } catch (error) {
    console.error('Error grading:', error)
    return NextResponse.json({ error: 'Failed to save grade' }, { status: 500 })
  }
})
