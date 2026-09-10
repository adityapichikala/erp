import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const applicantName = formData.get('applicantName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const programAppliedFor = formData.get('programAppliedFor') as string
    const document = formData.get('document') as File | null

    if (!applicantName || !email || !phone || !programAppliedFor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let documentsUrl = null
    if (document && document.size > 0) {
      const extension = document.name.split('.').pop()
      const fileName = `admissions/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
      
      // Convert File to Buffer
      const arrayBuffer = await document.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      documentsUrl = await uploadFile(buffer, fileName, document.type)
    }

    const admission = await db.admission.create({
      data: {
        applicantName,
        email: email.toLowerCase().trim(),
        phone,
        programAppliedFor,
        documentsUrl,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, id: admission.id }, { status: 201 })
  } catch (error) {
    console.error('Error in admission application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
