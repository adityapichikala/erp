import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SubmissionsClient } from './SubmissionsClient'

export default async function AssignmentSubmissionsPage(props: { params: Promise<{ assignmentId: string }> }) {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  const { assignmentId } = await props.params

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId }
  })

  if (!assignment || assignment.teacherId !== user.userId) {
    redirect('/dashboard/teacher/assignments')
  }

  return <SubmissionsClient assignmentId={assignmentId} assignment={assignment} />
}
