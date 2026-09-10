import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { uploadFile } from '@/lib/storage'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function isFileTypeAllowed(mime: string, allowedTypes: string[]): boolean {
  if (allowedTypes.includes('pdf') && mime === 'application/pdf') return true
  if (allowedTypes.includes('docx') && (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime === 'application/msword')) return true
  if (allowedTypes.includes('image') && mime.startsWith('image/')) return true
  if (allowedTypes.includes('zip') && (mime === 'application/zip' || mime === 'application/x-zip-compressed')) return true
  if (allowedTypes.includes('code') && (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml')) return true
  
  // Fallback check for common code extensions if the browser sends them as application/octet-stream or similar
  // In a robust implementation we'd check extensions too, but sticking to MIME here.
  return false
}

export const POST = requireRole(['STUDENT'], async (req, ctx, user) => {
  try {
    const { assignmentId } = await ctx.params

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    // Verify student is enrolled in the course
    const enrollment = await db.courseEnrollment.findFirst({
      where: { courseId: assignment.courseId, studentId: user.userId }
    })

    if (!enrollment) return NextResponse.json({ error: 'Forbidden: Not enrolled in this course' }, { status: 403 })

    // Check Due Date
    const now = new Date()
    if (now > assignment.dueDate) {
      return NextResponse.json({ error: 'Due date has passed. Submissions are no longer accepted.' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 400 })
    }

    if (!isFileTypeAllowed(file.type, assignment.allowedFileTypes)) {
      return NextResponse.json({ error: `File type ${file.type} is not allowed for this assignment.` }, { status: 400 })
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique storage path
    const extension = file.name.split('.').pop()
    const path = `assignments/${assignmentId}/${user.userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

    const fileUrl = await uploadFile(buffer, path, file.type)

    // Determine version and status
    const previousSubmissions = await db.submission.findMany({
      where: { assignmentId, studentId: user.userId },
      orderBy: { version: 'desc' }
    })

    const isLate = now > assignment.dueDate // Redundant check given the block above, but keeping for logic robustness if policies change
    const version = previousSubmissions.length > 0 ? previousSubmissions[0].version + 1 : 1
    const status = version > 1 ? 'RESUBMITTED' : (isLate ? 'LATE' : 'SUBMITTED')

    const submission = await db.submission.create({
      data: {
        assignmentId,
        studentId: user.userId,
        fileUrl,
        version,
        status,
        submittedAt: now
      }
    })

    return NextResponse.json({ success: true, submission }, { status: 201 })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 })
  }
})
