import { createServerClient } from '@/lib/supabase-server'
import { ApplyForm } from './ApplyForm'

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const supabase = createServerClient()
  
  // Fetch classes to use as available programs
  const { data: classes } = await supabase
    .from('Class')
    .select('name')
    .order('name', { ascending: true })

  const programs = (classes ?? []).map(c => c.name)

  // Fallback if no programs exist yet
  if (programs.length === 0) {
    programs.push('B.Tech Computer Science')
    programs.push('MBA Business Administration')
    programs.push('B.Sc Physics')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF8F3] px-4 py-12">
      <ApplyForm programs={programs} />
    </main>
  )
}

