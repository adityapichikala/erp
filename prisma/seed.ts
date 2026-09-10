import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with realistic demo data...')

  // Clean existing data
  await prisma.$transaction([
    prisma.certificate.deleteMany(),
    prisma.notificationRead.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.placementApplication.deleteMany(),
    prisma.placementDrive.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.hostelAllocation.deleteMany(),
    prisma.hostelRoom.deleteMany(),
    prisma.libraryIssue.deleteMany(),
    prisma.libraryItem.deleteMany(),
    prisma.feeRecord.deleteMany(),
    prisma.feeStructure.deleteMany(),
    prisma.examResult.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.timetableSlot.deleteMany(),
    prisma.courseEnrollment.deleteMany(),
    prisma.course.deleteMany(),
    prisma.class.deleteMany(),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
    prisma.college.deleteMany(),
  ])

  const passwordHash = await bcrypt.hash('demo123', 10)

  // 1. College
  const college = await prisma.college.create({
    data: { name: 'Global Tech University', address: '123 University Blvd, Tech City' }
  })

  // 2. Departments
  const cseDept = await prisma.department.create({ data: { name: 'Computer Science', collegeId: college.id } })
  const eceDept = await prisma.department.create({ data: { name: 'Electronics', collegeId: college.id } })
  const mechDept = await prisma.department.create({ data: { name: 'Mechanical', collegeId: college.id } })

  // 3. Staff Users
  const staffToCreate = [
    { name: 'Alice Admin', email: 'admin@gtu.edu', role: Role.COLLEGE_ADMIN },
    { name: 'Bob HOD', email: 'hod.cse@gtu.edu', role: Role.HOD, departmentId: cseDept.id },
    { name: 'Charlie Registrar', email: 'registrar@gtu.edu', role: Role.REGISTRAR },
    { name: 'Diana Finance', email: 'finance@gtu.edu', role: Role.FINANCE },
    { name: 'Eve Librarian', email: 'librarian@gtu.edu', role: Role.LIBRARIAN },
    { name: 'Frank Warden', email: 'warden@gtu.edu', role: Role.HOSTEL_WARDEN },
    { name: 'Grace HR', email: 'hr@gtu.edu', role: Role.HR },
    { name: 'Henry Placement', email: 'placement@gtu.edu', role: Role.PLACEMENT_OFFICER },
    ...Array.from({ length: 6 }).map((_, i) => ({
      name: `Teacher ${i + 1}`,
      email: `teacher${i + 1}@gtu.edu`,
      role: Role.TEACHER,
      departmentId: i < 3 ? cseDept.id : eceDept.id
    }))
  ]

  const staffMap: any = {}
  for (const s of staffToCreate) {
    const user = await prisma.user.create({
      data: { ...s, passwordHash, collegeId: college.id }
    })
    staffMap[user.email] = user
  }

  // Set HOD
  await prisma.department.update({
    where: { id: cseDept.id },
    data: { hodUserId: staffMap['hod.cse@gtu.edu'].id }
  })

  // 4. Courses & Classes
  const courses = [
    { name: 'Data Structures', code: 'CS201', deptId: cseDept.id, teacherEmail: 'teacher1@gtu.edu' },
    { name: 'Algorithms', code: 'CS202', deptId: cseDept.id, teacherEmail: 'teacher2@gtu.edu' },
    { name: 'Database Systems', code: 'CS301', deptId: cseDept.id, teacherEmail: 'teacher3@gtu.edu' },
    { name: 'Circuits', code: 'EC201', deptId: eceDept.id, teacherEmail: 'teacher4@gtu.edu' },
    { name: 'Signals', code: 'EC202', deptId: eceDept.id, teacherEmail: 'teacher5@gtu.edu' },
    { name: 'Thermodynamics', code: 'ME201', deptId: mechDept.id, teacherEmail: 'teacher6@gtu.edu' },
  ]

  const courseMap: any = {}
  for (const c of courses) {
    const course = await prisma.course.create({
      data: {
        name: c.name, code: c.code, departmentId: c.deptId,
        teacherId: staffMap[c.teacherEmail]?.id
      }
    })
    courseMap[c.code] = course
  }

  const classes = [
    { name: 'CS Year 2', deptId: cseDept.id, sem: 3, batch: 2024 },
    { name: 'CS Year 3', deptId: cseDept.id, sem: 5, batch: 2023 },
    { name: 'EC Year 2', deptId: eceDept.id, sem: 3, batch: 2024 },
  ]

  const classMap: any = {}
  for (const c of classes) {
    const cls = await prisma.class.create({
      data: { name: c.name, departmentId: c.deptId, semester: c.sem, batchYear: c.batch }
    })
    classMap[c.name] = cls
  }

  // 5. Timetable Slots
  await prisma.timetableSlot.create({ data: { courseId: courseMap['CS201'].id, classId: classMap['CS Year 2'].id, dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: 'Room 101' } })
  await prisma.timetableSlot.create({ data: { courseId: courseMap['CS202'].id, classId: classMap['CS Year 2'].id, dayOfWeek: 2, startTime: '10:00', endTime: '11:00', room: 'Room 102' } })
  await prisma.timetableSlot.create({ data: { courseId: courseMap['CS301'].id, classId: classMap['CS Year 3'].id, dayOfWeek: 3, startTime: '11:00', endTime: '12:00', room: 'Lab 1' } })

  // 6. Students & Enrollments
  const students = []
  for (let i = 1; i <= 40; i++) {
    const className = i <= 20 ? 'CS Year 2' : i <= 30 ? 'CS Year 3' : 'EC Year 2'
    const deptId = className.startsWith('CS') ? cseDept.id : eceDept.id

    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`, email: `student${i}@gtu.edu`, role: Role.STUDENT,
        passwordHash, collegeId: college.id, departmentId: deptId
      }
    })
    students.push({ user: student, className })

    // Enrollments
    const classId = classMap[className].id
    const courseIds = className === 'CS Year 2' ? [courseMap['CS201'].id, courseMap['CS202'].id] :
                      className === 'CS Year 3' ? [courseMap['CS301'].id] :
                      [courseMap['EC201'].id, courseMap['EC202'].id]
    
    for (const cid of courseIds) {
      await prisma.courseEnrollment.create({
        data: { studentId: student.id, classId, courseId: cid }
      })
    }
  }

  // 7. Attendance (last 2 weeks)
  const today = new Date()
  const cs201Students = students.filter(s => s.className === 'CS Year 2')
  for (let d = 0; d < 14; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue // skip weekends

    for (const s of cs201Students) {
      // 10% chance of being absent
      const isAbsent = Math.random() < 0.1
      // Force Student 1 to be below 75%
      const status = (s.user.email === 'student1@gtu.edu' && Math.random() < 0.4) || isAbsent ? 'ABSENT' : 'PRESENT'
      
      await prisma.attendance.create({
        data: { studentId: s.user.id, courseId: courseMap['CS201'].id, date, status }
      })
    }
  }

  // 8. Assignments & Submissions
  const t1Id = staffMap['teacher1@gtu.edu'].id
  const asg1 = await prisma.assignment.create({
    data: { courseId: courseMap['CS201'].id, teacherId: t1Id, title: 'Array Lab', description: 'Implement dynamic array', dueDate: new Date(today.getTime() - 86400000 * 5), maxMarks: 100, allowedFileTypes: ['pdf'] }
  })
  const asg2 = await prisma.assignment.create({
    data: { courseId: courseMap['CS201'].id, teacherId: t1Id, title: 'Linked List Lab', description: 'Implement doubly linked list', dueDate: new Date(today.getTime() + 86400000 * 5), maxMarks: 100, allowedFileTypes: ['pdf'] }
  })

  // Submissions for Student 1 and 2
  const s1 = students[0].user
  const s2 = students[1].user

  // Graded
  const sub1 = await prisma.submission.create({
    data: { assignmentId: asg1.id, studentId: s1.id, fileUrl: 'dummy.pdf', status: 'SUBMITTED' }
  })
  await prisma.grade.create({
    data: { submissionId: sub1.id, score: 85, feedback: 'Good job', gradedByUserId: t1Id }
  })

  // Ungraded
  await prisma.submission.create({
    data: { assignmentId: asg2.id, studentId: s1.id, fileUrl: 'dummy2.pdf', status: 'SUBMITTED' }
  })

  // Resubmission
  await prisma.submission.create({
    data: { assignmentId: asg1.id, studentId: s2.id, fileUrl: 'dummy3.pdf', status: 'RESUBMITTED', version: 2 }
  })

  // 9. Exams & Results
  const exam = await prisma.exam.create({
    data: { courseId: courseMap['CS201'].id, examDate: new Date(today.getTime() - 86400000 * 10), examType: 'MIDTERM', maxMarks: 50 }
  })

  for (const s of cs201Students) {
    const marks = Math.floor(Math.random() * 20) + 30 // 30-50
    const grade = marks >= 45 ? 'A' : marks >= 40 ? 'B' : marks >= 35 ? 'C' : 'D'
    await prisma.examResult.create({
      data: { examId: exam.id, studentId: s.user.id, marksObtained: marks, grade, publishedAt: new Date() }
    })
  }

  // 10. Fees
  const feeStruct = await prisma.feeStructure.create({
    data: { collegeId: college.id, programName: 'B.Tech CS 2nd Year', batchYear: 2024, amount: 50000, dueDate: new Date(today.getTime() - 86400000 * 30) }
  })

  await prisma.feeRecord.create({ data: { studentId: s1.id, feeStructureId: feeStruct.id, amountPaid: 50000, status: 'PAID' } })
  await prisma.feeRecord.create({ data: { studentId: s2.id, feeStructureId: feeStruct.id, amountPaid: 0, status: 'OVERDUE' } })

  // 11. Library
  const book1 = await prisma.libraryItem.create({ data: { title: 'Introduction to Algorithms', author: 'Cormen', totalCopies: 5, availableCopies: 4 } })
  const book2 = await prisma.libraryItem.create({ data: { title: 'Clean Code', author: 'Martin', totalCopies: 2, availableCopies: 2 } })

  await prisma.libraryIssue.create({
    data: { itemId: book1.id, studentId: s1.id, issuedAt: new Date(today.getTime() - 86400000 * 20), dueAt: new Date(today.getTime() - 86400000 * 6), fineAmount: 120 }
  })

  // 12. Hostel
  const room = await prisma.hostelRoom.create({ data: { block: 'A', roomNumber: '101', capacity: 2 } })
  await prisma.hostelAllocation.create({ data: { studentId: s1.id, roomId: room.id } })

  // 13. Placements
  const drive = await prisma.placementDrive.create({
    data: { collegeId: college.id, companyName: 'TechCorp', role: 'SDE', eligibilityCriteria: 'CGPA > 8.0', driveDate: new Date(today.getTime() + 86400000 * 15), packageOffered: '15 LPA' }
  })
  await prisma.placementApplication.create({ data: { driveId: drive.id, studentId: s1.id, status: 'SHORTLISTED' } })

  // 14. Notifications
  await prisma.notification.create({
    data: { title: 'Welcome to Fall Semester', body: 'Classes begin today.', createdByUserId: staffMap['admin@gtu.edu'].id, collegeId: college.id }
  })
  await prisma.notification.create({
    data: { title: 'Fee Deadline Reminder', body: 'Please pay your dues.', createdByUserId: staffMap['finance@gtu.edu'].id, targetRole: 'STUDENT', collegeId: college.id }
  })

  console.log('\n--- DEMO ACCOUNTS ---')
  console.log('Password for all accounts: demo123')
  console.log('\n| Role | Email |')
  console.log('|------|-------|')
  Object.values(staffMap).forEach((u: any) => {
    console.log(`| ${u.role.padEnd(15)} | ${u.email} |`)
  })
  console.log(`| STUDENT | student1@gtu.edu |`)
  console.log(`| STUDENT | student2@gtu.edu |`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
