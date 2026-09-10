import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { GradingClient } from './GradingClient'
import { getFileUrl } from '@/lib/storage'

export default async function GradingPage(props: { params: Promise<{ assignmentId: string, submissionId: string }> }) {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  const { assignmentId, submissionId } = await props.params

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId }
  })

  if (!assignment || assignment.teacherId !== user.userId) {
    redirect('/dashboard/teacher/assignments')
  }

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: { select: { name: true, email: true } },
      grade: {
        include: {
          gradedBy: { select: { name: true } }
        }
      }
    }
  })

  if (!submission || submission.assignmentId !== assignmentId) {
    redirect(`/dashboard/teacher/assignments/${assignmentId}`)
  }

  // Generate signed URL for preview
  // Note: getFileUrl expects the path as stored in DB.
  // The DB stores 'assignments/...' so we just pass it.
  const signedUrl = await getFileUrl(submission.fileUrl)

  return (
    <GradingClient 
      assignmentId={assignmentId} 
      submissionId={submissionId} 
      assignment={assignment} 
      submission={submission}
      fileUrl={signedUrl}
    />
  )
}
