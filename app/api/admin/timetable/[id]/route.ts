import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const DELETE = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    await db.timetableSlot.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete timetable slot' }, { status: 500 })
  }
})
