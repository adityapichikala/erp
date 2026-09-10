import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import crypto from 'crypto';

function genId() {
  return crypto.randomUUID();
}

export async function GET(request: Request) {
  const supabase = createServerClient();

  try {
    // 1. Create College
    const collegeId = genId();
    await supabase.from('College').insert({
      id: collegeId,
      name: 'Apex Institute of Technology',
      address: '123 University Ave, Silicon Valley',
      updatedAt: new Date().toISOString()
    });

    // 2. Create Departments
    const depts = [
      { id: genId(), name: 'Computer Science', collegeId, updatedAt: new Date().toISOString() },
      { id: genId(), name: 'Electronics', collegeId, updatedAt: new Date().toISOString() },
      { id: genId(), name: 'Mechanical', collegeId, updatedAt: new Date().toISOString() },
      { id: genId(), name: 'Civil', collegeId, updatedAt: new Date().toISOString() }
    ];
    await supabase.from('Department').insert(depts);

    // 3. Create Teachers (2-3 teachers)
    const teachers = [
      { id: genId(), name: 'Dr. Alan Turing', email: 'alan@apex.edu', passwordHash: 'hash', role: 'TEACHER', departmentId: depts[0].id, collegeId, updatedAt: new Date().toISOString() },
      { id: genId(), name: 'Dr. Marie Curie', email: 'marie@apex.edu', passwordHash: 'hash', role: 'TEACHER', departmentId: depts[1].id, collegeId, updatedAt: new Date().toISOString() },
      { id: genId(), name: 'Dr. Nikola Tesla', email: 'nikola@apex.edu', passwordHash: 'hash', role: 'TEACHER', departmentId: depts[2].id, collegeId, updatedAt: new Date().toISOString() },
    ];
    await supabase.from('User').insert(teachers);

    // 4. Create Classes
    const classes = depts.map(d => ({
      id: genId(),
      name: `B.Tech ${d.name} 2026`,
      departmentId: d.id,
      semester: 3,
      batchYear: 2026,
      updatedAt: new Date().toISOString()
    }));
    await supabase.from('Class').insert(classes);

    // 5. Create Courses
    const courses = depts.map((d, index) => ({
      id: genId(),
      name: `Intro to ${d.name}`,
      code: `CS${101 + index}`,
      departmentId: d.id,
      credits: 3,
      teacherId: teachers[index % teachers.length].id,
      updatedAt: new Date().toISOString()
    }));
    await supabase.from('Course').insert(courses);

    // 6. Create Students & Enrollments (approx 5-6 per department, total 24)
    const students = [];
    const enrollments = [];

    let studentIndex = 1;
    for (let i = 0; i < depts.length; i++) {
      const dept = depts[i];
      const cls = classes[i];
      const course = courses[i];

      for (let j = 0; j < 6; j++) {
        const studentId = genId();
        const regNumber = `12305${studentIndex.toString().padStart(3, '0')}`;
        students.push({
          id: studentId,
          name: `Student ${regNumber}`,
          email: `${regNumber}@apex.edu`, // email as unique reg number
          passwordHash: 'hash',
          role: 'STUDENT',
          departmentId: dept.id,
          collegeId,
          updatedAt: new Date().toISOString()
        });

        enrollments.push({
          id: genId(),
          studentId: studentId,
          courseId: course.id,
          classId: cls.id,
          updatedAt: new Date().toISOString()
        });
        
        studentIndex++;
      }
    }

    await supabase.from('User').insert(students);
    await supabase.from('CourseEnrollment').insert(enrollments);

    return NextResponse.json({ success: true, message: 'Seeded 1 College, 4 Depts, 3 Teachers, 4 Courses, 24 Students' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
