import { PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ─── Clean up ──────────────────────────────────────────────────────────────
  // Delete in reverse dependency order to avoid FK violations
  await db.agentActionLog.deleteMany()
  await db.notificationRead.deleteMany()
  await db.notification.deleteMany()
  await db.certificate.deleteMany()
  await db.placementApplication.deleteMany()
  await db.placementDrive.deleteMany()
  await db.leaveRequest.deleteMany()
  await db.employee.deleteMany()
  await db.hostelAllocation.deleteMany()
  await db.hostelRoom.deleteMany()
  await db.libraryIssue.deleteMany()
  await db.libraryItem.deleteMany()
  await db.feeRecord.deleteMany()
  await db.feeStructure.deleteMany()
  await db.examResult.deleteMany()
  await db.exam.deleteMany()
  await db.grade.deleteMany()
  await db.submission.deleteMany()
  await db.assignment.deleteMany()
  await db.attendance.deleteMany()
  await db.timetableSlot.deleteMany()
  await db.courseEnrollment.deleteMany()
  await db.course.deleteMany()
  await db.class.deleteMany()
  await db.admission.deleteMany()
  await db.department.deleteMany()
  await db.user.deleteMany()
  await db.college.deleteMany()

  const passwordHash = await bcrypt.hash('Demo1234!', 12)

  // ─── College ───────────────────────────────────────────────────────────────
  const college = await db.college.create({
    data: {
      name: 'Greenfield University',
      address: '1 University Avenue, Hyderabad, Telangana 500032',
    },
  })
  console.log(`✅ College: ${college.name}`)

  // ─── Departments ──────────────────────────────────────────────────────────
  const deptCS = await db.department.create({
    data: {
      name: 'Computer Science & Engineering',
      collegeId: college.id,
    },
  })
  const deptMBA = await db.department.create({
    data: {
      name: 'Business Administration',
      collegeId: college.id,
    },
  })
  console.log(`✅ Departments: ${deptCS.name}, ${deptMBA.name}`)

  // ─── Users (one per role) ──────────────────────────────────────────────────
  const roles: { role: Role; email: string; name: string; deptId?: string }[] = [
    { role: 'SUPER_ADMIN',       email: 'superadmin@demo.edu',   name: 'Super Admin' },
    { role: 'COLLEGE_ADMIN',     email: 'admin@demo.edu',        name: 'College Admin',       deptId: deptCS.id },
    { role: 'HOD',               email: 'hod@demo.edu',          name: 'Dr. Priya Sharma',    deptId: deptCS.id },
    { role: 'TEACHER',           email: 'teacher@demo.edu',      name: 'Prof. Ravi Kumar',    deptId: deptCS.id },
    { role: 'TA',                email: 'ta@demo.edu',           name: 'Anjali Gupta',        deptId: deptCS.id },
    { role: 'STUDENT',           email: 'student@demo.edu',      name: 'Arjun Patel',         deptId: deptCS.id },
    { role: 'REGISTRAR',         email: 'registrar@demo.edu',    name: 'Mr. Samuel Thomas' },
    { role: 'FINANCE',           email: 'finance@demo.edu',      name: 'Ms. Lakshmi Nair' },
    { role: 'LIBRARIAN',         email: 'librarian@demo.edu',    name: 'Mr. George Philip' },
    { role: 'HOSTEL_WARDEN',     email: 'warden@demo.edu',       name: 'Mr. Ramesh Rao' },
    { role: 'HR',                email: 'hr@demo.edu',           name: 'Ms. Divya Menon' },
    { role: 'PLACEMENT_OFFICER', email: 'placement@demo.edu',    name: 'Mr. Vikram Singh' },
    { role: 'PARENT',            email: 'parent@demo.edu',       name: 'Mr. Suresh Patel' },
  ]

  const createdUsers: Record<string, Awaited<ReturnType<typeof db.user.create>>> = {}

  for (const u of roles) {
    const user = await db.user.create({
      data: {
        name:         u.name,
        email:        u.email,
        passwordHash,
        role:         u.role,
        status:       'ACTIVE' as UserStatus,
        collegeId:    college.id,
        departmentId: u.deptId ?? null,
      },
    })
    createdUsers[u.role] = user
  }
  console.log(`✅ Created ${roles.length} demo users`)

  // Link HOD to department
  await db.department.update({
    where: { id: deptCS.id },
    data: { hodUserId: createdUsers['HOD'].id },
  })

  // ─── Courses ──────────────────────────────────────────────────────────────
  const courses = await Promise.all([
    db.course.create({ data: { name: 'Data Structures & Algorithms', code: 'CS101', departmentId: deptCS.id, credits: 4, teacherId: createdUsers['TEACHER'].id } }),
    db.course.create({ data: { name: 'Operating Systems', code: 'CS201', departmentId: deptCS.id, credits: 3, teacherId: createdUsers['TEACHER'].id } }),
    db.course.create({ data: { name: 'Database Management Systems', code: 'CS301', departmentId: deptCS.id, credits: 3, teacherId: createdUsers['TEACHER'].id } }),
  ])
  console.log(`✅ Created ${courses.length} courses`)

  // ─── Classes ──────────────────────────────────────────────────────────────
  const classA = await db.class.create({
    data: {
      name: 'CS-2024-A',
      departmentId: deptCS.id,
      semester: 3,
      batchYear: 2024,
    },
  })
  const classB = await db.class.create({
    data: {
      name: 'CS-2024-B',
      departmentId: deptCS.id,
      semester: 3,
      batchYear: 2024,
    },
  })
  console.log(`✅ Created 2 classes`)

  // ─── Enroll demo student in all courses ───────────────────────────────────
  for (const course of courses) {
    await db.courseEnrollment.create({
      data: {
        studentId: createdUsers['STUDENT'].id,
        courseId:  course.id,
        classId:   classA.id,
      },
    })
  }
  console.log(`✅ Enrolled demo student in all courses`)

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70))
  console.log('🎓 DEMO LOGIN CREDENTIALS (password: Demo1234! for all)')
  console.log('─'.repeat(70))
  for (const u of roles) {
    console.log(`${u.role.padEnd(20)} ${u.email}`)
  }
  console.log('─'.repeat(70))
  console.log('✅ Seed complete!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
