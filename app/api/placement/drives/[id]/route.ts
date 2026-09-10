import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const PUT = requireRole(['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { companyName, role, eligibilityCriteria, driveDate, packageOffered } = body

    const drive = await db.placementDrive.update({
      where: { id },
      data: {
        companyName,
        role,
        eligibilityCriteria,
        driveDate: driveDate ? new Date(driveDate) : undefined,
        packageOffered
      }
    })

    return NextResponse.json({ drive })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update placement drive' }, { status: 500 })
  }
})

export const DELETE = requireRole(['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    
    await db.placementDrive.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete placement drive' }, { status: 500 })
  }
})
