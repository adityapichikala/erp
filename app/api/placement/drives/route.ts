import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const filter = user.collegeId ? { collegeId: user.collegeId } : {}

    const drives = await db.placementDrive.findMany({
      where: filter,
      orderBy: { driveDate: 'desc' }
    })
    
    return NextResponse.json({ drives })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch placement drives' }, { status: 500 })
  }
})

export const POST = requireRole(['PLACEMENT_OFFICER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { companyName, role, eligibilityCriteria, driveDate, packageOffered, collegeId } = body

    if (!companyName || !role || !eligibilityCriteria || !driveDate || !packageOffered) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const finalCollegeId = user.collegeId || collegeId
    if (!finalCollegeId) return NextResponse.json({ error: 'College ID required' }, { status: 400 })

    const drive = await db.placementDrive.create({
      data: {
        companyName,
        role,
        eligibilityCriteria,
        driveDate: new Date(driveDate),
        packageOffered,
        collegeId: finalCollegeId
      }
    })

    return NextResponse.json({ drive }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create placement drive' }, { status: 500 })
  }
})
