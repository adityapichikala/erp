import { db } from '@/lib/db'
import Link from 'next/link'

export async function AdminDashboard({ user }: { user: any }) {
  const collegeFilter = user.collegeId ? { collegeId: user.collegeId } : {}
  const userCollegeFilter = user.collegeId ? { collegeId: user.collegeId } : {}

  // Total Students
  const totalStudents = await db.user.count({
    where: { role: 'STUDENT', ...userCollegeFilter }
  })

  // Total Staff
  const totalStaff = await db.user.count({
    where: { role: { notIn: ['STUDENT', 'PARENT'] }, ...userCollegeFilter }
  })

  // Pending Admissions
  const pendingAdmissions = await db.admission.count({
    where: { status: 'PENDING', ...collegeFilter }
  })

  // Fee Collection %
  // Total PAID vs Total Due
  const feeRecords = await db.feeRecord.findMany({
    where: { student: { collegeId: user.collegeId } },
    select: { amountPaid: true, status: true, feeStructure: { select: { amount: true } } }
  })
  const totalDue = feeRecords.reduce((sum, f) => sum + f.feeStructure.amount, 0)
  const totalCollected = feeRecords.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.feeStructure.amount, 0)
  const feeCollectionPercent = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0

  // Attendance %
  const attendanceRecords = await db.attendance.findMany({
    where: { student: { collegeId: user.collegeId } },
    select: { status: true }
  })
  const totalAttendance = attendanceRecords.length
  const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length
  const attendancePercent = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
        Admin Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatBox title="Total Students" value={totalStudents.toString()} />
        <StatBox title="Total Staff" value={totalStaff.toString()} />
        <StatBox title="Fee Collection" value={`${feeCollectionPercent}%`} />
        <StatBox title="Avg Attendance" value={`${attendancePercent}%`} />
        <StatBox title="Pending Admissions" value={pendingAdmissions.toString()} />
      </div>
    </div>
  )
}

function StatBox({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</div>
      <div className="text-3xl font-bold" style={{ color: 'var(--color-navy)' }}>{value}</div>
    </div>
  )
}
