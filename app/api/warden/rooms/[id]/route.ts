import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const PUT = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { block, roomNumber, capacity } = body

    if (capacity !== undefined) {
      const parsedCapacity = parseInt(capacity, 10)
      const activeAllocations = await db.hostelAllocation.count({
        where: { roomId: id, vacatedAt: null }
      })
      if (parsedCapacity < activeAllocations) {
        return NextResponse.json({ error: 'Cannot reduce capacity below current active allocations' }, { status: 400 })
      }
    }

    const room = await db.hostelRoom.update({
      where: { id },
      data: {
        block,
        roomNumber,
        capacity: capacity ? parseInt(capacity, 10) : undefined
      }
    })

    return NextResponse.json({ room })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
})

export const DELETE = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    
    const activeAllocations = await db.hostelAllocation.count({
      where: { roomId: id, vacatedAt: null }
    })

    if (activeAllocations > 0) {
      return NextResponse.json({ error: 'Cannot delete room with active allocations' }, { status: 400 })
    }

    await db.hostelRoom.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
})
