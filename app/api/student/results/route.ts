import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { calculateCGPA } from '@/lib/grading'

export const GET = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    // Only fetch results where publishedAt is NOT null
    const results = await db.examResult.findMany({
      where: {
        studentId: user.userId,
        publishedAt: { not: null }
      },
      include: {
        exam: {
          include: {
            course: { select: { name: true, code: true, credits: true } }
          }
        }
      },
      orderBy: { exam: { examDate: 'desc' } }
    })

    const cgpa = calculateCGPA(results)

    return NextResponse.json({ results, cgpa })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
})
