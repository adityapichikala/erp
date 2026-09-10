import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const PUT = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { title, author, isbn, totalCopies } = body

    const existing = await db.libraryItem.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    let updatedAvailable = existing.availableCopies
    if (totalCopies !== undefined) {
      const diff = parseInt(totalCopies, 10) - existing.totalCopies
      updatedAvailable = existing.availableCopies + diff
      if (updatedAvailable < 0) {
        return NextResponse.json({ error: 'Cannot reduce total copies below currently issued count' }, { status: 400 })
      }
    }

    const item = await db.libraryItem.update({
      where: { id },
      data: {
        title,
        author,
        isbn,
        totalCopies: totalCopies ? parseInt(totalCopies, 10) : undefined,
        availableCopies: updatedAvailable
      }
    })

    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update library item' }, { status: 500 })
  }
})

export const DELETE = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    
    // Check if there are active issues
    const activeIssues = await db.libraryIssue.count({
      where: { itemId: id, returnedAt: null }
    })

    if (activeIssues > 0) {
      return NextResponse.json({ error: 'Cannot delete item with active issues' }, { status: 400 })
    }

    await db.libraryItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete library item' }, { status: 500 })
  }
})
