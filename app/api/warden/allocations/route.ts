import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const allocations = await db.hostelAllocation.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        room: true
      },
      orderBy: { allocatedAt: 'desc' }
    })
    return NextResponse.json({ allocations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 })
  }
})

export const POST = requireRole(['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { studentId, roomId } = body

    if (!studentId || !roomId) {
      return NextResponse.json({ error: 'Missing studentId or roomId' }, { status: 400 })
    }

    const room = await db.hostelRoom.findUnique({
      where: { id: roomId },
      include: { _count: { select: { allocations: { where: { vacatedAt: null } } } } }
    })

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    if (room._count.allocations >= room.capacity) {
      return NextResponse.json({ error: 'Room is at capacity' }, { status: 400 })
    }

    // Check if student already has an active allocation
    const existing = await db.hostelAllocation.findFirst({
      where: { studentId, vacatedAt: null }
    })

    if (existing) {
      return NextResponse.json({ error: 'Student is already allocated to a room' }, { status: 400 })
    }

    const allocation = await db.hostelAllocation.create({
      data: {
        studentId,
        roomId
      },
      include: { room: true, student: { select: { name: true } } }
    })

    return NextResponse.json({ allocation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to allocate room' }, { status: 500 })
  }
})
