import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getSessionUserFromCookies } from '@/lib/auth'

export const GET = async (req: NextRequest) => {
  try {
    const user = await getSessionUserFromCookies()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServerClient()

    // Fetch notifications for this college scoped to the user's role
    let query = supabase
      .from('Notification')
      .select(`
        id, title, body, targetRole, targetDepartmentId, targetClassId, collegeId, createdAt,
        reads:NotificationRead(userId)
      `)
      .order('createdAt', { ascending: false })
      .limit(50)

    if (user.collegeId) {
      query = query.eq('collegeId', user.collegeId)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('[GET /api/notifications]', error)
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    // Client-side filter by scope
    const relevant = (notifications ?? []).filter((n: any) => {
      if (!n.targetRole && !n.targetDepartmentId && !n.targetClassId) return true // global
      if (n.targetRole === user.role) return true
      if (n.targetDepartmentId && n.targetDepartmentId === user.departmentId) return true
      return false
    })

    const unreadCount = relevant.filter((n: any) =>
      !n.reads?.some((r: any) => r.userId === user.userId)
    ).length

    return NextResponse.json({ notifications: relevant, unreadCount })
  } catch (error) {
    console.error('[GET /api/notifications]', error)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}
