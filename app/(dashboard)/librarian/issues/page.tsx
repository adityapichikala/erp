import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { IssuesClient } from './IssuesClient'

export default async function LibraryIssuesPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  // Fetch all students for the dropdown
  const filter: any = { role: 'STUDENT' }
  if (user.collegeId) {
    filter.collegeId = user.collegeId
  }

  const students = await db.user.findMany({
    where: filter,
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  })

  // Fetch all books for the dropdown
  const books = await db.libraryItem.findMany({
    select: { id: true, title: true, availableCopies: true },
    orderBy: { title: 'asc' }
  })

  return <IssuesClient students={students} books={books} />
}
