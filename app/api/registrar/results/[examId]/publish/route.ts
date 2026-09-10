import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { examId } = await ctx.params

    const resultsCount = await db.examResult.count({ where: { examId } })
    if (resultsCount === 0) {
      return NextResponse.json({ error: 'No marks entered for this exam yet.' }, { status: 400 })
    }

    await db.examResult.updateMany({
      where: { examId, publishedAt: null },
      data: { publishedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to publish results' }, { status: 500 })
  }
})
