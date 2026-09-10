import { getSessionUserFromCookies } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { MarksEntryClient } from './MarksEntryClient'

export default async function MarksEntryPage() {
  const user = await getSessionUserFromCookies()

  if (!user || user.role !== 'TEACHER') {
    redirect('/login')
  }

  // Fetch exams for the teacher's courses
  const exams = await db.exam.findMany({
    where: {
      course: { teacherId: user.userId }
    },
    include: {
      course: { select: { id: true, name: true, code: true } }
    },
    orderBy: { examDate: 'desc' }
  })

  return <MarksEntryClient exams={exams} />
}
