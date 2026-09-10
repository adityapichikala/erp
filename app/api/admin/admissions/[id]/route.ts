import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

// PUT /api/admin/admissions/[id] - Update status or merit score
export const PUT = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'REGISTRAR'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { status, meritScore } = body

    const admission = await db.admission.findUnique({ where: { id } })
    if (!admission) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 })
    }

    const dataToUpdate: any = {}
    if (status) dataToUpdate.status = status
    if (meritScore !== undefined) dataToUpdate.meritScore = meritScore

    const updatedAdmission = await db.admission.update({
      where: { id },
      data: dataToUpdate
    })

    return NextResponse.json({ admission: updatedAdmission })
  } catch (error) {
    console.error('Error updating admission:', error)
    return NextResponse.json({ error: 'Failed to update admission application' }, { status: 500 })
  }
})
