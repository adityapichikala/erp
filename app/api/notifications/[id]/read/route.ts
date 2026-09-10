import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromCookies } from '@/lib/auth'

export const POST = async (req: NextRequest, ctx: any) => {
  try {
    const { id } = await ctx.params
    const user = await getSessionUserFromCookies()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Upsert read record to avoid duplicates if marked multiple times
    await db.notificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId: id,
          userId: user.userId
        }
      },
      update: {},
      create: {
        notificationId: id,
        userId: user.userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
  }
}
