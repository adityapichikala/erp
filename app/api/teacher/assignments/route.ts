import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const assignments = await db.assignment.findMany({
      where: { teacherId: user.userId },
      include: {
        course: { select: { name: true, code: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
})

export const POST = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { courseId, title, description, dueDate, maxMarks, rubric, allowedFileTypes } = body

    if (!courseId || !title || !description || !dueDate || !maxMarks || !Array.isArray(allowedFileTypes)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify teacher teaches this course
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only create assignments for your own courses' }, { status: 403 })
    }

    const assignment = await db.assignment.create({
      data: {
        courseId,
        teacherId: user.userId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks: parseFloat(maxMarks),
        rubric: rubric || null,
        allowedFileTypes // Array of strings like ["pdf", "image", "docx", "zip", "code"]
      }
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
})
