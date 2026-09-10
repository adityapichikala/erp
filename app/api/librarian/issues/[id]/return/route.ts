import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

const FINE_PER_DAY = 1.00 // $1 per day late

export const POST = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params

    const issue = await db.libraryIssue.findUnique({ where: { id } })
    if (!issue) return NextResponse.json({ error: 'Issue record not found' }, { status: 404 })
    if (issue.returnedAt) return NextResponse.json({ error: 'Book already returned' }, { status: 400 })

    const returnedAt = new Date()
    
    // Compute fine
    let fineAmount = 0
    if (returnedAt > issue.dueAt) {
      const diffTime = Math.abs(returnedAt.getTime() - issue.dueAt.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      fineAmount = diffDays * FINE_PER_DAY
    }

    const updatedIssue = await db.$transaction(async (tx) => {
      // Increment available copies
      await tx.libraryItem.update({
        where: { id: issue.itemId },
        data: { availableCopies: { increment: 1 } }
      })

      // Mark as returned and apply fine
      return await tx.libraryIssue.update({
        where: { id },
        data: {
          returnedAt,
          fineAmount
        }
      })
    })

    return NextResponse.json({ issue: updatedIssue })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to return book' }, { status: 500 })
  }
})
