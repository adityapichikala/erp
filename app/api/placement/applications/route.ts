import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const filter = user.collegeId ? { drive: { collegeId: user.collegeId } } : {}

    const applications = await db.placementApplication.findMany({
      where: filter,
      include: {
        drive: true,
        student: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ applications })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch placement applications' }, { status: 500 })
  }
})
