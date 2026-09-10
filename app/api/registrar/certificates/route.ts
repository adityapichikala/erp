import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { uploadFile } from '@/lib/storage'
import crypto from 'crypto'

export const POST = requireRole(['REGISTRAR', 'SUPER_ADMIN', 'COLLEGE_ADMIN'], async (req, ctx, user) => {
  try {
    const body = await req.json()
    const { studentId, type } = body

    if (!studentId || !type) {
      return NextResponse.json({ error: 'Missing studentId or type' }, { status: 400 })
    }

    const student = await db.user.findUnique({
      where: { id: studentId },
      include: {
        college: true,
        department: true,
        enrollments: { include: { class: true } }
      }
    })

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // 1. Validation Logic
    if (type === 'NO_DUES') {
      const pendingFees = await db.feeRecord.findMany({
        where: { studentId, status: { in: ['PENDING', 'OVERDUE'] } },
        include: { feeStructure: true }
      })

      const pendingBooks = await db.libraryIssue.findMany({
        where: { studentId, returnedAt: null },
        include: { item: true }
      })

      if (pendingFees.length > 0 || pendingBooks.length > 0) {
        let errorMsg = 'Cannot generate No-Dues Certificate. Outstanding items:\n'
        pendingFees.forEach(f => errorMsg += `- Fee Due: ₹${f.feeStructure.amount} (${f.feeStructure.programName})\n`)
        pendingBooks.forEach(b => errorMsg += `- Unreturned Book: ${b.item.title}\n`)
        return NextResponse.json({ error: errorMsg }, { status: 400 })
      }
    }

    // 2. Fetch Transcript Data
    let examResults: any[] = []
    let cgpa = 0
    if (type === 'TRANSCRIPT') {
      examResults = await db.examResult.findMany({
        where: { studentId, publishedAt: { not: null } },
        include: { exam: { include: { course: true } } }
      })
      
      // Simple CGPA calculation (sum of marks / total max marks) * 10
      const totalObtained = examResults.reduce((sum, r) => sum + r.marksObtained, 0)
      const totalMax = examResults.reduce((sum, r) => sum + r.exam.maxMarks, 0)
      if (totalMax > 0) {
        cgpa = Number(((totalObtained / totalMax) * 10).toFixed(2))
      }
    }

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    const drawTextCentered = (text: string, y: number, font: any, size: number) => {
      const textWidth = font.widthOfTextAtSize(text, size)
      page.drawText(text, { x: (width - textWidth) / 2, y, font, size })
    }

    // Header
    const collegeName = student.college?.name || 'University ERP Institution'
    drawTextCentered(collegeName.toUpperCase(), height - 80, timesBoldFont, 24)
    drawTextCentered(student.department?.name || 'Department', height - 110, timesRomanFont, 16)

    // Divider
    page.drawLine({
      start: { x: 50, y: height - 130 },
      end: { x: width - 50, y: height - 130 },
      thickness: 1,
      color: rgb(0, 0, 0)
    })

    const titleStr = type === 'TRANSCRIPT' ? 'ACADEMIC TRANSCRIPT' : 
                     type === 'NO_DUES' ? 'NO-DUES CERTIFICATE' : 'BONAFIDE CERTIFICATE'
    
    drawTextCentered(titleStr, height - 170, timesBoldFont, 18)

    // Date
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 210, font: timesRomanFont, size: 12 })
    page.drawText(`Student ID: ${student.id.slice(-8).toUpperCase()}`, { x: width - 200, y: height - 210, font: timesRomanFont, size: 12 })

    // Body
    let currentY = height - 260
    
    if (type === 'BONAFIDE') {
      const text = `This is to certify that ${student.name} is a bona fide student of ${collegeName}, enrolled in the ${student.department?.name || 'program'} during the current academic year.`
      page.drawText(text, { x: 50, y: currentY, font: timesRomanFont, size: 14, maxWidth: width - 100, lineHeight: 24 })
    } 
    else if (type === 'NO_DUES') {
      const text = `This is to certify that ${student.name} has cleared all dues with the institution, including academic fees, library fines, and hostel dues. There are no outstanding liabilities against the student as of ${new Date().toLocaleDateString()}.`
      page.drawText(text, { x: 50, y: currentY, font: timesRomanFont, size: 14, maxWidth: width - 100, lineHeight: 24 })
    }
    else if (type === 'TRANSCRIPT') {
      const text = `Student Name: ${student.name}\nDepartment: ${student.department?.name || 'N/A'}\nOverall CGPA: ${cgpa} / 10.0`
      page.drawText(text, { x: 50, y: currentY, font: timesRomanFont, size: 14, lineHeight: 24 })
      
      currentY -= 80
      page.drawText('Academic Record:', { x: 50, y: currentY, font: timesBoldFont, size: 14 })
      
      currentY -= 30
      // Table Header
      page.drawText('Course', { x: 50, y: currentY, font: timesBoldFont, size: 12 })
      page.drawText('Exam', { x: 300, y: currentY, font: timesBoldFont, size: 12 })
      page.drawText('Marks', { x: 400, y: currentY, font: timesBoldFont, size: 12 })
      page.drawText('Grade', { x: 500, y: currentY, font: timesBoldFont, size: 12 })
      
      currentY -= 20
      page.drawLine({ start: { x: 50, y: currentY + 15 }, end: { x: width - 50, y: currentY + 15 }, thickness: 1 })

      examResults.forEach(r => {
        currentY -= 20
        page.drawText(r.exam.course.name.slice(0, 30), { x: 50, y: currentY, font: timesRomanFont, size: 12 })
        page.drawText(r.exam.examType, { x: 300, y: currentY, font: timesRomanFont, size: 12 })
        page.drawText(`${r.marksObtained}/${r.exam.maxMarks}`, { x: 400, y: currentY, font: timesRomanFont, size: 12 })
        page.drawText(r.grade, { x: 500, y: currentY, font: timesRomanFont, size: 12 })

        if (currentY < 100) {
          // Simplistic pagination logic if needed
        }
      })
    }

    // Signature
    page.drawText('Registrar Signature', { x: width - 200, y: 100, font: timesRomanFont, size: 12 })
    page.drawLine({ start: { x: width - 200, y: 120 }, end: { x: width - 50, y: 120 }, thickness: 1 })

    const pdfBytes = await pdfDoc.save()
    const buffer = Buffer.from(pdfBytes)

    // 4. Storage & Persistence
    const uniqueId = crypto.randomBytes(8).toString('hex')
    const fileName = `certificates/${studentId}_${type}_${uniqueId}.pdf`
    
    const fileUrl = await uploadFile(buffer, fileName, 'application/pdf')

    const certificate = await db.certificate.create({
      data: {
        studentId,
        type: type as any,
        fileUrl: fileUrl // This is the bucket path
      }
    })

    return NextResponse.json({ certificate }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to generate certificate' }, { status: 500 })
  }
})
