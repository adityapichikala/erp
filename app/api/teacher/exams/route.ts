import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const exams = await db.exam.findMany({
      where: {
        course: { teacherId: user.userId }
      },
      include: {
        course: { select: { name: true, code: true } }
      },
      orderBy: { examDate: 'desc' }
    })
    return NextResponse.json({ exams })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teacher exams' }, { status: 500 })
  }
})
