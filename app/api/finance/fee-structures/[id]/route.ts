import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const DELETE = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    await db.feeStructure.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete fee structure' }, { status: 500 })
  }
})

export const PUT = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { programName, batchYear, amount, dueDate } = body

    const structure = await db.feeStructure.update({
      where: { id },
      data: {
        programName,
        batchYear: batchYear ? parseInt(batchYear, 10) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    })

    return NextResponse.json({ structure })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update fee structure' }, { status: 500 })
  }
})
