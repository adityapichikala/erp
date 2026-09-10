import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const DELETE = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    
    const assignment = await db.assignment.findUnique({ where: { id } })
    if (!assignment || assignment.teacherId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.assignment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
})
