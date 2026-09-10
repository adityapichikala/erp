import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['FINANCE', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { action, paymentDate, transactionRef, waiverReason } = body

    const record = await db.feeRecord.findUnique({
      where: { id },
      include: { feeStructure: true }
    })

    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    let updateData: any = {}

    if (action === 'PAID') {
      updateData = {
        status: 'PAID',
        amountPaid: record.feeStructure.amount, // Set amountPaid to full amount
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        transactionRef
      }
    } else if (action === 'WAIVED') {
      if (!waiverReason) {
        return NextResponse.json({ error: 'Waiver reason is required' }, { status: 400 })
      }
      updateData = {
        status: 'WAIVED',
        waiverReason
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updated = await db.feeRecord.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ record: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update fee record' }, { status: 500 })
  }
})
