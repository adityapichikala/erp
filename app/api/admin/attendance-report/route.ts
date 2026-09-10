import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get('departmentId')

  // Base course filter
  const courseFilter: any = {}
  if (departmentId) courseFilter.departmentId = departmentId
  if (user.role === 'COLLEGE_ADMIN' && user.collegeId) {
    courseFilter.department = { collegeId: user.collegeId }
  } else if (user.role === 'HOD' && user.departmentId) {
    courseFilter.departmentId = user.departmentId
  }

  try {
    const courses = await db.course.findMany({
      where: courseFilter,
      select: { id: true, name: true, code: true, department: { select: { name: true } } }
    })

    const courseIds = courses.map(c => c.id)

    // Aggregate attendance
    // Use group by to get counts per course
    const attendanceGroups = await db.attendance.groupBy({
      by: ['courseId', 'status'],
      where: { courseId: { in: courseIds } },
      _count: true
    })

    const reportMap = new Map<string, any>()
    for (const c of courses) {
      reportMap.set(c.id, {
        courseId: c.id,
        courseName: c.name,
        courseCode: c.code,
        department: c.department.name,
        totalClasses: 0,
        presentClasses: 0,
        lateClasses: 0,
        absentClasses: 0,
        percentage: 0
      })
    }

    for (const group of attendanceGroups) {
      const stat = reportMap.get(group.courseId)
      if (stat) {
        stat.totalClasses += group._count
        if (group.status === 'PRESENT') stat.presentClasses += group._count
        else if (group.status === 'LATE') stat.lateClasses += group._count
        else if (group.status === 'ABSENT') stat.absentClasses += group._count
      }
    }

    // Calculate percentages
    for (const stat of Array.from(reportMap.values())) {
      if (stat.totalClasses > 0) {
        stat.percentage = Math.round(((stat.presentClasses + stat.lateClasses) / stat.totalClasses) * 100)
      }
    }

    return NextResponse.json({ report: Array.from(reportMap.values()) })
  } catch (error) {
    console.error('Report error', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
})
