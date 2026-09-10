import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get('departmentId')

  const filter: any = {}
  if (departmentId) filter.departmentId = departmentId
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    filter.department = { collegeId: user.collegeId }
  } else if (user.role === 'HOD' && user.departmentId) {
    filter.departmentId = user.departmentId
  }

  try {
    const classes = await db.class.findMany({
      where: filter,
      include: {
        department: { select: { name: true } },
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Group enrollments count by student (distinct student count per class)
    // Since CourseEnrollment is per course per class, a student taking 5 courses in a class has 5 enrollments.
    // We want the distinct number of students enrolled in the class.
    
    // Better way: fetch distinct studentIds per classId
    const enrollments = await db.courseEnrollment.groupBy({
      by: ['classId', 'studentId'],
      where: { classId: { in: classes.map(c => c.id) } }
    })
    
    const studentCountMap = new Map<string, Set<string>>()
    for (const e of enrollments) {
      if (!studentCountMap.has(e.classId)) studentCountMap.set(e.classId, new Set())
      studentCountMap.get(e.classId)!.add(e.studentId)
    }

    const enhancedClasses = classes.map(c => ({
      ...c,
      studentCount: studentCountMap.get(c.id)?.size || 0
    }))

    return NextResponse.json({ classes: enhancedClasses })
  } catch (error) {
    console.error('Error fetching classes', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
})

export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { name, departmentId, semester, batchYear } = body

    if (!name || !departmentId || !semester || !batchYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (user.role === 'HOD' && user.departmentId !== departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const newClass = await db.class.create({
      data: {
        name,
        departmentId,
        semester: parseInt(semester),
        batchYear: parseInt(batchYear)
      }
    })

    return NextResponse.json({ class: newClass }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
})
