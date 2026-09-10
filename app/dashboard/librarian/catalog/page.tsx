import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CatalogClient } from './CatalogClient'

export default async function CatalogPage() {
  const user = await getSessionUserFromCookies()

  if (!user || !['LIBRARIAN', 'SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user.role)) {
    redirect('/login')
  }

  return <CatalogClient />
}
