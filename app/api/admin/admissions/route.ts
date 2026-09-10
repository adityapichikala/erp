import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

// GET /api/admin/admissions - List applications
export const GET = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'REGISTRAR'], async (req, ctx, user) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  
  const filter: any = {}
  if (status) filter.status = status

  try {
    const admissions = await db.admission.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ admissions })
  } catch (error) {
    console.error('Error fetching admissions:', error)
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 })
  }
})
