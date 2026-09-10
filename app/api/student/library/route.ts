import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    const issues = await db.libraryIssue.findMany({
      where: { studentId: user.userId },
      include: {
        item: true
      },
      orderBy: { issuedAt: 'desc' }
    })
    
    return NextResponse.json({ issues })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch library issues' }, { status: 500 })
  }
})
