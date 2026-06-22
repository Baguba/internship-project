import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/applications/[id]/submit - submit application for review
// Requires: complete personal info, complete business info, passed assessment, at least national ID + business plan documents
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const app = await db.application.findUnique({
    where: { id },
    include: { documents: true },
  })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (user.role === 'APPLICANT' && app.applicantId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (app.status !== 'DRAFT') {
    return NextResponse.json({ error: 'This application has already been submitted.' }, { status: 400 })
  }

  // Validate required fields
  const missing: string[] = []
  const required = [
    ['fullName', 'Full name'],
    ['dateOfBirth', 'Date of birth'],
    ['nationalId', 'National ID'],
    ['phoneNumber', 'Phone number'],
    ['email', 'Email'],
    ['city', 'City'],
    ['businessName', 'Business name'],
    ['businessType', 'Business type'],
    ['businessSector', 'Business sector'],
    ['businessAddress', 'Business address'],
  ] as const
  for (const [k, label] of required) {
    const v = (app as Record<string, unknown>)[k]
    if (!v || (typeof v === 'string' && v.trim() === '')) missing.push(label)
  }
  if (missing.length) {
    return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 })
  }
  if (!app.assessmentPassed) {
    return NextResponse.json({ error: 'You must complete and pass the competence assessment before submitting.' }, { status: 400 })
  }

  // Validate required documents
  const docTypes = app.documents.map(d => d.documentType)
  if (!docTypes.includes('NATIONAL_ID')) {
    return NextResponse.json({ error: 'A National ID document is required.' }, { status: 400 })
  }
  if (!docTypes.includes('BUSINESS_PLAN')) {
    return NextResponse.json({ error: 'A Business Plan document is required.' }, { status: 400 })
  }

  const updated = await db.application.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  })

  // Notify all reviewers / admins
  const staff = await db.user.findMany({
    where: { role: { in: ['REVIEWER', 'ADMIN'] }, isActive: true },
    select: { id: true },
  })
  if (staff.length > 0) {
    await db.notification.createMany({
      data: staff.map(s => ({
        userId: s.id,
        title: 'New application submitted',
        message: `Application ${app.referenceNumber} from ${app.fullName} is awaiting review.`,
        type: 'INFO',
        link: `review:${app.id}`,
      })),
    })
  }

  // Confirmation notification to applicant
  await db.notification.create({
    data: {
      userId: app.applicantId,
      title: 'Application submitted',
      message: `Your application ${app.referenceNumber} has been submitted and is awaiting review.`,
      type: 'SUCCESS',
    },
  })

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'SUBMIT_APP',
      targetType: 'Application',
      targetId: app.id,
      details: `Submitted ${app.referenceNumber}`,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    },
  })

  return NextResponse.json({ application: updated })
}
