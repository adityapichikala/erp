import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { status } = body

    const application = await db.placementApplication.update({
      where: { id },
      data: { status: status as any }
    })

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
  }
})
