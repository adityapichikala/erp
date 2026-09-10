import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const PUT = requireRole(['HR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { designation, departmentId, salaryBand, joinedAt } = body

    const employee = await db.employee.update({
      where: { id },
      data: {
        designation,
        departmentId,
        salaryBand,
        joinedAt: joinedAt ? new Date(joinedAt) : undefined
      }
    })

    return NextResponse.json({ employee })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
})

export const DELETE = requireRole(['HR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    
    await db.employee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
})
