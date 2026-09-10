import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const filter = user.collegeId ? { feeStructure: { collegeId: user.collegeId } } : {}

    const records = await db.feeRecord.findMany({
      where: filter,
      include: {
        feeStructure: true
      }
    })

    // Group by programName and batchYear
    const grouped: Record<string, { programName: string, batchYear: number, totalDue: number, totalCollected: number, studentCount: number }> = {}

    for (const r of records) {
      const key = `${r.feeStructure.programName}_${r.feeStructure.batchYear}`
      if (!grouped[key]) {
        grouped[key] = {
          programName: r.feeStructure.programName,
          batchYear: r.feeStructure.batchYear,
          totalDue: 0,
          totalCollected: 0,
          studentCount: 0
        }
      }

      grouped[key].studentCount++
      grouped[key].totalDue += r.feeStructure.amount
      
      if (r.status === 'PAID') {
        grouped[key].totalCollected += r.amountPaid
      }
    }

    const reportData = Object.values(grouped).sort((a, b) => b.batchYear - a.batchYear || a.programName.localeCompare(b.programName))

    return NextResponse.json({ report: reportData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate finance report' }, { status: 500 })
  }
})
