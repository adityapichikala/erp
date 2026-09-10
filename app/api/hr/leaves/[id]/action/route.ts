import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['HR', 'HOD', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { action } = body

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const leaveRequest = await db.leaveRequest.findUnique({ where: { id } })
    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const updated = await db.leaveRequest.update({
      where: { id },
      data: {
        status: action as any,
        reviewedAt: new Date()
      }
    })

    return NextResponse.json({ leaveRequest: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 })
  }
})
