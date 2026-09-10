import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SubmitClient } from './SubmitClient'

export default async function StudentSubmitPage(props: { params: Promise<{ assignmentId: string }> }) {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'STUDENT') {
    redirect('/login')
  }

  const { assignmentId } = await props.params

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: { select: { name: true, teacher: { select: { name: true } } } }
    }
  })

  if (!assignment) {
    redirect('/dashboard/student/assignments')
  }

  // Check enrollment
  const enrollment = await db.courseEnrollment.findFirst({
    where: { courseId: assignment.courseId, studentId: user.userId }
  })

  if (!enrollment) {
    redirect('/dashboard/student/assignments')
  }

  // Get latest submission
  const submissions = await db.submission.findMany({
    where: { assignmentId, studentId: user.userId },
    orderBy: { version: 'desc' },
    take: 1,
    include: {
      grade: {
        include: {
          gradedBy: { select: { name: true } }
        }
      }
    }
  })

  return <SubmitClient assignment={assignment} submission={submissions[0] || null} />
}
