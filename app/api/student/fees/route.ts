import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    // Explicitly scope to the logged-in student to prevent cross-student viewing
    const records = await db.feeRecord.findMany({
      where: { studentId: user.userId },
      include: {
        feeStructure: true
      },
      orderBy: { feeStructure: { dueDate: 'asc' } }
    })
    
    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch student fee records' }, { status: 500 })
  }
})
