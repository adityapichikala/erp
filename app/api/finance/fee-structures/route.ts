import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const filter = user.collegeId ? { collegeId: user.collegeId } : {}

    const feeStructures = await db.feeStructure.findMany({
      where: filter,
      include: {
        _count: { select: { feeRecords: true } }
      },
      orderBy: [{ batchYear: 'desc' }, { programName: 'asc' }]
    })
    return NextResponse.json({ feeStructures })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fee structures' }, { status: 500 })
  }
})

export const POST = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { programName, batchYear, amount, dueDate, collegeId } = body

    if (!programName || !batchYear || !amount || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Default to the user's collegeId if not provided (or if user is Super Admin but didn't provide one)
    const finalCollegeId = user.collegeId || collegeId
    if (!finalCollegeId) {
       return NextResponse.json({ error: 'College ID is required for Super Admins' }, { status: 400 })
    }

    const structure = await db.feeStructure.create({
      data: {
        programName,
        batchYear: parseInt(batchYear, 10),
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        collegeId: finalCollegeId
      }
    })

    return NextResponse.json({ structure }, { status: 201 })
  } catch (error) {
    console.error('Create fee structure error:', error)
    return NextResponse.json({ error: 'Failed to create fee structure' }, { status: 500 })
  }
})
