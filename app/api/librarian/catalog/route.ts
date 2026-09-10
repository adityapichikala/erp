import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const items = await db.libraryItem.findMany({
      orderBy: { title: 'asc' }
    })
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 })
  }
})

export const POST = requireRole(['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { title, author, isbn, totalCopies } = body

    if (!title || !author || !totalCopies) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const item = await db.libraryItem.create({
      data: {
        title,
        author,
        isbn,
        totalCopies: parseInt(totalCopies, 10),
        availableCopies: parseInt(totalCopies, 10)
      }
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create library item' }, { status: 500 })
  }
})
