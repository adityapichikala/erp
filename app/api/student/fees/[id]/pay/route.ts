import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const POST = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params

    const record = await db.feeRecord.findUnique({
      where: { id },
      include: { feeStructure: true }
    })

    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    // Security check: Must belong to the session student
    if (record.studentId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (record.status === 'PAID' || record.status === 'WAIVED') {
      return NextResponse.json({ error: 'Fee is already paid or waived' }, { status: 400 })
    }

    // TODO: Integrate Razorpay/Stripe here.
    // For now, simulate a successful payment gateway response.
    const fakeTransactionRef = `sim_pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const updated = await db.feeRecord.update({
      where: { id },
      data: {
        status: 'PAID',
        amountPaid: record.feeStructure.amount,
        paymentDate: new Date(),
        transactionRef: fakeTransactionRef
      }
    })

    return NextResponse.json({ success: true, transactionRef: fakeTransactionRef, record: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Payment simulation failed' }, { status: 500 })
  }
})
