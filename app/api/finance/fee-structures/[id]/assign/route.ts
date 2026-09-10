import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const feeStructureId = id

    const structure = await db.feeStructure.findUnique({ where: { id: feeStructureId } })
    if (!structure) {
      return NextResponse.json({ error: 'Fee structure not found' }, { status: 404 })
    }

    // Find classes matching the programName (roughly map programName to course or class somehow, 
    // or just find enrollments in classes that match the batchYear)
    // For this ERP, Class has `batchYear`. We might not have a direct `programName` on User, 
    // but let's assign to all active students in the structure's college matching the batchYear 
    // (In a real ERP, student's program is usually more strictly typed).
    
    // For now, let's find all users who are STUDENT, in the same college, and enrolled in a class of this batchYear.
    const eligibleStudents = await db.user.findMany({
      where: {
        role: 'STUDENT',
        collegeId: structure.collegeId,
        enrollments: {
          some: {
            class: {
              batchYear: structure.batchYear
            }
          }
        }
      },
      select: { id: true }
    })

    let assignedCount = 0
    await db.$transaction(async (tx) => {
      for (const student of eligibleStudents) {
        // Upsert to avoid duplicates
        const existing = await tx.feeRecord.findUnique({
          where: {
            studentId_feeStructureId: {
              studentId: student.id,
              feeStructureId
            }
          }
        })

        if (!existing) {
          await tx.feeRecord.create({
            data: {
              studentId: student.id,
              feeStructureId,
              status: 'PENDING',
              amountPaid: 0
            }
          })
          assignedCount++
        }
      }
    })

    return NextResponse.json({ success: true, assignedCount })
  } catch (error) {
    console.error('Assign fees error:', error)
    return NextResponse.json({ error: 'Failed to assign fees' }, { status: 500 })
  }
})
