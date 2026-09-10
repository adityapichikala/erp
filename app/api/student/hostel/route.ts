import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    const allocations = await db.hostelAllocation.findMany({
      where: { studentId: user.userId },
      include: {
        room: true
      },
      orderBy: { allocatedAt: 'desc' }
    })
    
    return NextResponse.json({ allocations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hostel allocations' }, { status: 500 })
  }
})
