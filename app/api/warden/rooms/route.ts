import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const rooms = await db.hostelRoom.findMany({
      include: {
        _count: {
          select: {
            allocations: { where: { vacatedAt: null } }
          }
        }
      },
      orderBy: [{ block: 'asc' }, { roomNumber: 'asc' }]
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
})

export const POST = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { block, roomNumber, capacity } = body

    if (!block || !roomNumber || !capacity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const room = await db.hostelRoom.create({
      data: {
        block,
        roomNumber,
        capacity: parseInt(capacity, 10)
      }
    })

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
})
