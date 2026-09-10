import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params

    const allocation = await db.hostelAllocation.findUnique({ where: { id } })
    if (!allocation) return NextResponse.json({ error: 'Allocation not found' }, { status: 404 })
    if (allocation.vacatedAt) return NextResponse.json({ error: 'Already vacated' }, { status: 400 })

    const updated = await db.hostelAllocation.update({
      where: { id },
      data: { vacatedAt: new Date() }
    })

    return NextResponse.json({ allocation: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vacate room' }, { status: 500 })
  }
})
