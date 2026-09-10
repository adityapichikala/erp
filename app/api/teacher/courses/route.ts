import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['TEACHER'], async (req, ctx, user) => {
  try {
    const courses = await db.course.findMany({
      where: { teacherId: user.userId },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ courses })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teacher courses' }, { status: 500 })
  }
})
