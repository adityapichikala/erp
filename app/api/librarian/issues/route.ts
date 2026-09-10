import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const issues = await db.libraryIssue.findMany({
      include: {
        item: true,
        student: { select: { id: true, name: true, email: true } }
      },
      orderBy: { issuedAt: 'desc' }
    })
    return NextResponse.json({ issues })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
  }
})

export const POST = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { itemId, studentId } = body

    if (!itemId || !studentId) {
      return NextResponse.json({ error: 'Missing itemId or studentId' }, { status: 400 })
    }

    const item = await db.libraryItem.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    if (item.availableCopies <= 0) {
      return NextResponse.json({ error: 'No copies available' }, { status: 400 })
    }

    const dueAt = new Date()
    dueAt.setDate(dueAt.getDate() + 14) // 14 days default

    const issue = await db.$transaction(async (tx) => {
      await tx.libraryItem.update({
        where: { id: itemId },
        data: { availableCopies: { decrement: 1 } }
      })

      return await tx.libraryIssue.create({
        data: {
          itemId,
          studentId,
          dueAt
        },
        include: { item: true, student: { select: { name: true } } }
      })
    })

    return NextResponse.json({ issue }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to issue book' }, { status: 500 })
  }
})
