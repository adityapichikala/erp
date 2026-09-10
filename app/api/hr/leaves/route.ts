import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export const GET = requireRole(['HR', 'HOD', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const filter: any = {}
    
    // HODs should ideally only see their department's leaves, but for simplicity we show all 
    // to these elevated roles or scope by college. Let's scope by college.
    if (user.collegeId) {
      filter.employee = { user: { collegeId: user.collegeId } }
    }

    const leaveRequests = await db.leaveRequest.findMany({
      where: filter,
      include: {
        employee: { 
          include: { 
            user: { select: { name: true, email: true } },
            department: { select: { name: true } }
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ leaveRequests })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 })
  }
})
