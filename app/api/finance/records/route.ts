import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    const filter: any = {}
    if (user.collegeId) {
      filter.feeStructure = { collegeId: user.collegeId }
    }
    
    if (status) {
      filter.status = status
    }

    const records = await db.feeRecord.findMany({
      where: filter,
      include: {
        student: { select: { name: true, email: true } },
        feeStructure: true
      },
      orderBy: [
        { feeStructure: { dueDate: 'asc' } },
        { student: { name: 'asc' } }
      ]
    })
    
    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fee records' }, { status: 500 })
  }
})
