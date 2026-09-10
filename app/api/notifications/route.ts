import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromCookies } from '@/lib/auth'

export const GET = async (req: NextRequest) => {
  try {
    const user = await getSessionUserFromCookies()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find classes user is associated with (student enrollments or teacher assignments)
    let classIds: string[] = []
    
    if (user.role === 'STUDENT') {
      const enrollments = await db.courseEnrollment.findMany({ where: { studentId: user.userId }, select: { classId: true } })
      classIds = enrollments.map(e => e.classId)
    } else if (user.role === 'TEACHER') {
      const slots = await db.timetableSlot.findMany({ where: { course: { teacherId: user.userId } }, select: { classId: true } })
      classIds = slots.map(s => s.classId)
    }

    const filters: any[] = []

    // Base scoping logic:
    // A notification is relevant if it targets everyone, OR targets the user's role, OR targets their department, OR targets their class.
    
    const scopeConditions: any[] = [
      { targetRole: null, targetDepartmentId: null, targetClassId: null }, // Global
      { targetRole: user.role }, // Role-specific
    ]

    if (user.departmentId) {
      scopeConditions.push({ targetDepartmentId: user.departmentId })
    }

    if (classIds.length > 0) {
      scopeConditions.push({ targetClassId: { in: classIds } })
    }

    const whereClause: any = {
      OR: scopeConditions
    }

    if (user.collegeId) {
      whereClause.collegeId = user.collegeId
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        reads: {
          where: { userId: user.userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50
    })

    const unreadCount = notifications.filter(n => n.reads.length === 0).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
