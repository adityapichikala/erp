import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { requireRole } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

// Helper to generate a random temp password
function generateTempPassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// POST /api/admin/admissions/[id]/convert - Convert application to student
export const POST = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'REGISTRAR'], async (req, ctx, sessionUser) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { departmentId, classId } = body

    if (!departmentId || !classId) {
      return NextResponse.json({ error: 'Department and Class are required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: admissions } = await supabase.from('Admission').select('*').eq('id', id).limit(1)
    const admission = admissions?.[0]
    
    if (!admission) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 })
    }

    if (admission.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only APPROVED applications can be converted' }, { status: 400 })
    }

    if (admission.convertedToUserId) {
      return NextResponse.json({ error: 'Application already converted' }, { status: 400 })
    }

    // Ensure email is unique
    const { data: existingUsers } = await supabase.from('User').select('id').eq('email', admission.email).limit(1)
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const crypto = require('crypto')
    const newUserId = crypto.randomUUID()

    // 1. Create User
    const { error: userError } = await supabase.from('User').insert({
      id: newUserId,
      name: admission.applicantName,
      email: admission.email,
      passwordHash,
      role: 'STUDENT',
      departmentId,
      collegeId: sessionUser.collegeId || undefined,
      updatedAt: new Date().toISOString()
    })

    if (userError) throw userError

    // 2. Update admission record
    await supabase.from('Admission').update({
      convertedToUserId: newUserId,
      convertedByUserId: sessionUser.userId,
      updatedAt: new Date().toISOString()
    }).eq('id', id)

    // 3. Fetch courses for this class and enroll
    const { data: classCourses } = await supabase.from('TimetableSlot').select('courseId').eq('classId', classId)
    
    // Get unique course IDs
    const uniqueCourseIds = [...new Set((classCourses ?? []).map((c: any) => c.courseId))]
    
    if (uniqueCourseIds.length > 0) {
      const enrollments = uniqueCourseIds.map(courseId => ({
        id: crypto.randomUUID(),
        studentId: newUserId,
        courseId: courseId,
        classId: classId,
        updatedAt: new Date().toISOString()
      }))
      
      await supabase.from('CourseEnrollment').insert(enrollments)
    }

    return NextResponse.json({ 
      success: true, 
      userId: newUserId,
      tempPassword
    })
  } catch (error) {
    console.error('Error converting admission:', error)
    return NextResponse.json({ error: 'Failed to convert application' }, { status: 500 })
  }
})
