import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromCookies } from '@/lib/auth'

export const GET = async (req: NextRequest) => {
  try {
    const user = await getSessionUserFromCookies()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const employee = await db.employee.findUnique({ where: { userId: user.userId } })
    if (!employee) return NextResponse.json({ error: 'User is not an employee' }, { status: 403 })

    const leaveRequests = await db.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ leaveRequests })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const user = await getSessionUserFromCookies()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const employee = await db.employee.findUnique({ where: { userId: user.userId } })
    if (!employee) return NextResponse.json({ error: 'User is not an employee' }, { status: 403 })

    const body = await req.json()
    const { startDate, endDate, reason } = body

    if (!startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        employeeId: employee.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      }
    })

    return NextResponse.json({ leaveRequest }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit leave request' }, { status: 500 })
  }
}
