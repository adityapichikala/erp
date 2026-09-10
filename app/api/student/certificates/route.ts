import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUserFromCookies } from '@/lib/auth'
import { getFileUrl } from '@/lib/storage'

export const GET = async (req: NextRequest) => {
  try {
    const user = await getSessionUserFromCookies()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const certificates = await db.certificate.findMany({
      where: { studentId: user.userId },
      orderBy: { createdAt: 'desc' }
    })

    // Map over certificates to attach signed URLs
    const withUrls = await Promise.all(
      certificates.map(async (cert) => {
        try {
          const signedUrl = await getFileUrl(cert.fileUrl, 3600) // 1 hour expiry
          return { ...cert, signedUrl }
        } catch {
          return { ...cert, signedUrl: null }
        }
      })
    )

    return NextResponse.json({ certificates: withUrls })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
