import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

    const admission = await db.admission.findUnique({ where: { id } })
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
    const existingUser = await db.user.findUnique({ where: { email: admission.email } })
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    // Transaction to create user, enroll in class (if we have class modeling for students)
    // and update admission record
    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: admission.applicantName,
          email: admission.email,
          passwordHash,
          role: 'STUDENT',
          departmentId,
          collegeId: sessionUser.collegeId || undefined,
        }
      })

      // Update admission record
      await tx.admission.update({
        where: { id },
        data: {
          convertedToUserId: newUser.id,
          convertedByUserId: sessionUser.userId
        }
      })

      // Since the schema has CourseEnrollment, we might just store the student's association 
      // through the User table's departmentId for now. A student is enrolled in courses individually.
      // But we can fetch courses for this classId and enroll them if needed. For now, creating the user is primary.
      
      // Let's just create an empty enrollment record or assume department/class assignment is enough.
      // Schema Class has: enrollments CourseEnrollment[].
      // CourseEnrollment requires studentId, courseId, classId. 
      // We will skip enrolling into specific courses automatically unless required.
      // But the requirement says "Department/Class assignment".
      // Since User model doesn't have a direct classId field, we might just need to keep the classId for reference, 
      // or we can just return the user. Wait, if we must assign a Class, let's just enroll them in all courses of that class.
      
      const classCourses = await tx.timetableSlot.findMany({
        where: { classId },
        select: { courseId: true },
        distinct: ['courseId']
      })
      
      if (classCourses.length > 0) {
        const enrollments = classCourses.map(c => ({
          studentId: newUser.id,
          courseId: c.courseId,
          classId: classId
        }))
        await tx.courseEnrollment.createMany({
          data: enrollments,
          skipDuplicates: true
        })
      }

      return { user: newUser, tempPassword }
    })

    return NextResponse.json({ 
      success: true, 
      userId: result.user.id,
      tempPassword: result.tempPassword
    })
  } catch (error) {
    console.error('Error converting admission:', error)
    return NextResponse.json({ error: 'Failed to convert application' }, { status: 500 })
  }
})
