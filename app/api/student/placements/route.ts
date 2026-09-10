import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const drives = await db.placementDrive.findMany({
      where: {
        driveDate: { gte: today },
        ...(user.collegeId ? { collegeId: user.collegeId } : {})
      },
      include: {
        applications: {
          where: { studentId: user.userId },
          select: { status: true }
        }
      },
      orderBy: { driveDate: 'asc' }
    })
    
    return NextResponse.json({ drives })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch placement drives' }, { status: 500 })
  }
})

export const POST = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { driveId } = body

    if (!driveId) return NextResponse.json({ error: 'Missing driveId' }, { status: 400 })

    const existing = await db.placementApplication.findUnique({
      where: { driveId_studentId: { driveId, studentId: user.userId } }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already applied for this drive' }, { status: 400 })
    }

    const application = await db.placementApplication.create({
      data: {
        driveId,
        studentId: user.userId
      }
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
})
