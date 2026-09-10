import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AllocationsClient } from './AllocationsClient'

export default async function HostelAllocationsPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['HOSTEL_WARDEN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  const filter: any = { role: 'STUDENT' }
  if (user.collegeId) {
    filter.collegeId = user.collegeId
  }

  const students = await db.user.findMany({
    where: filter,
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  })

  const rooms = await db.hostelRoom.findMany({
    include: { _count: { select: { allocations: { where: { vacatedAt: null } } } } },
    orderBy: [{ block: 'asc' }, { roomNumber: 'asc' }]
  })

  // Filter out rooms that are full
  const availableRooms = rooms.filter(r => r._count.allocations < r.capacity)

  return <AllocationsClient students={students} rooms={availableRooms} />
}
