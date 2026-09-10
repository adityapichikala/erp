import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { requireRole } from '@/lib/rbac'

// PUT /api/admin/admissions/[id] - Update status or merit score
export const PUT = requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'REGISTRAR'], async (req, ctx, user) => {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { status, meritScore } = body

    const supabase = createServerClient()
    const { data: admissions } = await supabase.from('Admission').select('id').eq('id', id).limit(1)
    
    if (!admissions || admissions.length === 0) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 })
    }

    const dataToUpdate: any = { updatedAt: new Date().toISOString() }
    if (status) dataToUpdate.status = status
    if (meritScore !== undefined) dataToUpdate.meritScore = meritScore

    const { data: updatedAdmission, error } = await supabase
      .from('Admission')
      .update(dataToUpdate)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ admission: updatedAdmission?.[0] })
  } catch (error) {
    console.error('Error updating admission:', error)
    return NextResponse.json({ error: 'Failed to update admission application' }, { status: 500 })
  }
})
