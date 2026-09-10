'use server'

import { createServerClient } from '@/lib/supabase-server'
import { getSessionUserFromCookies } from '@/lib/auth'

export async function getEnrolledStudentsForAttendance(courseId: string, date: string) {
  const user = await getSessionUserFromCookies()
  if (!user || user.role !== 'TEACHER') {
    throw new Error('Unauthorized')
  }

  const supabase = createServerClient()

  // 1. Get enrollments for this course
  const { data: enrollments, error: enrollError } = await supabase
    .from('CourseEnrollment')
    .select('studentId, student:studentId(id, name, email)')
    .eq('courseId', courseId)

  if (enrollError) {
    throw new Error('Failed to fetch enrollments')
  }

  // 2. Get existing attendance for this date and course
  const { data: attendanceRecords, error: attError } = await supabase
    .from('Attendance')
    .select('studentId, status')
    .eq('courseId', courseId)
    .eq('date', date)

  if (attError) {
    throw new Error('Failed to fetch attendance')
  }

  const attendanceMap = new Map()
  attendanceRecords?.forEach(record => {
    attendanceMap.set(record.studentId, record.status)
  })

  // Format the result
  const students = (enrollments ?? []).map((e: any) => ({
    id: e.student.id,
    name: e.student.name,
    email: e.student.email, // using email as registration number
    status: attendanceMap.get(e.student.id) || null // 'PRESENT', 'ABSENT', 'LATE', or null
  }))

  // Sort alphabetically by name
  return students.sort((a, b) => a.name.localeCompare(b.name))
}

export async function saveAttendance(courseId: string, date: string, records: { studentId: string, status: string }[]) {
  const user = await getSessionUserFromCookies()
  if (!user || user.role !== 'TEACHER') {
    throw new Error('Unauthorized')
  }

  const supabase = createServerClient()

  // We can upsert the attendance records
  // Because Attendance table has @@unique([studentId, courseId, date]) in Prisma, 
  // but in Supabase we might need to rely on the underlying Postgres constraint.
  // Instead of upsert, we can delete existing and insert new for simplicity to ensure clean state.
  
  await supabase
    .from('Attendance')
    .delete()
    .eq('courseId', courseId)
    .eq('date', date)

  if (records.length > 0) {
    const { error } = await supabase
      .from('Attendance')
      .insert(records.map(r => ({
        studentId: r.studentId,
        courseId,
        date,
        status: r.status,
        updatedAt: new Date().toISOString()
      })))

    if (error) {
      throw new Error(`Failed to save attendance: ${error.message}`)
    }
  }

  return { success: true }
}
