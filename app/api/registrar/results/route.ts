import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const exams = await db.exam.findMany({
      include: {
        course: { 
          select: { 
            name: true, 
            code: true, 
            _count: { select: { enrollments: true } }
          } 
        },
        _count: { select: { results: true } },
        results: {
          select: { publishedAt: true },
          take: 1
        }
      },
      orderBy: { examDate: 'desc' }
    })

    const resultsSummary = exams.map(exam => {
      const isPublished = exam.results.length > 0 && exam.results[0].publishedAt !== null
      const totalEnrolled = exam.course._count.enrollments
      const totalEntered = exam._count.results
      return {
        ...exam,
        totalEnrolled,
        totalEntered,
        isPublished,
        readyToPublish: totalEntered > 0 && !isPublished
      }
    })

    return NextResponse.json({ summary: resultsSummary })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results summary' }, { status: 500 })
  }
})
