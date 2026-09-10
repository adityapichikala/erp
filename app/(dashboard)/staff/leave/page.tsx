import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StaffLeaveClient } from './StaffLeaveClient'

export default async function StaffLeavePage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role === 'STUDENT' || user.role === 'PARENT') {
    redirect('/login')
  }

  // Ensure they have an employee record
  const employee = await db.employee.findUnique({ where: { userId: user.userId } })
  if (!employee) {
    return (
      <div className="p-8 text-center text-gray-500">
        You do not have an active employee record. Please contact HR.
      </div>
    )
  }

  return <StaffLeaveClient />
}
