import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const exams = await db.exam.findMany({
      include: {
        course: { select: { name: true, code: true, department: { select: { name: true } } } },
        _count: { select: { results: true } }
      },
      orderBy: { examDate: 'desc' }
    })
    return NextResponse.json({ exams })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
})

export const POST = requireRole(['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { courseId, examDate, examType, maxMarks } = body

    if (!courseId || !examDate || !examType || !maxMarks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exam = await db.exam.create({
      data: {
        courseId,
        examDate: new Date(examDate),
        examType,
        maxMarks: parseFloat(maxMarks)
      }
    })

    return NextResponse.json({ exam }, { status: 201 })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
})
