import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)

  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all attendance records for this student
    const records = await db.attendance.findMany({
      where: { studentId: user.userId },
      include: {
        course: { select: { id: true, name: true, code: true } }
      },
      orderBy: { date: 'desc' }
    })

    // Aggregate by course
    const courseStats = new Map<string, {
      courseId: string,
      courseName: string,
      courseCode: string,
      totalClasses: number,
      presentClasses: number,
      lateClasses: number,
      absentClasses: number,
      percentage: number
    }>()

    for (const rec of records) {
      const cId = rec.courseId
      if (!courseStats.has(cId)) {
        courseStats.set(cId, {
          courseId: cId,
          courseName: rec.course.name,
          courseCode: rec.course.code,
          totalClasses: 0,
          presentClasses: 0,
          lateClasses: 0,
          absentClasses: 0,
          percentage: 0
        })
      }

      const stat = courseStats.get(cId)!
      stat.totalClasses++
      
      if (rec.status === 'PRESENT') stat.presentClasses++
      else if (rec.status === 'LATE') stat.lateClasses++
      else if (rec.status === 'ABSENT') stat.absentClasses++

      // Consider Late as Present for percentage, or half? 
      // Typically Late is counted as present but marked late. Let's count it as present.
      stat.percentage = Math.round(((stat.presentClasses + stat.lateClasses) / stat.totalClasses) * 100)
    }

    return NextResponse.json({
      summary: Array.from(courseStats.values()),
      recentRecords: records.slice(0, 20) // send last 20 records for history view
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}
