import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateCertificateNumber, nextCertificateSequence } from '@/lib/helpers'

// GET: list all applications in the review queue
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // optional filter

  const where = status ? { status } : {
    status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CERTIFICATE_ISSUED'] },
  }

  const applications = await db.application.findMany({
    where,
    orderBy: [{ status: 'asc' }, { submittedAt: 'desc' }],
    include: {
      applicant: {
        select: { id: true, fullName: true, email: true, phoneNumber: true, city: true },
      },
      reviewer: {
        select: { id: true, fullName: true, officeName: true },
      },
      _count: { select: { documents: true } },
      certificate: { select: { id: true, certificateNumber: true, status: true } },
    },
    take: 200,
  })

  return NextResponse.json({ applications })
}

// PATCH: take action on an application
// Body: { applicationId, action: 'CLAIM' | 'APPROVE' | 'REJECT', note?: string }
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { applicationId, action, note } = body
  if (!applicationId || !['CLAIM', 'APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ error: 'applicationId and a valid action are required.' }, { status: 400 })
  }

  const app = await db.application.findUnique({ where: { id: applicationId } })
  if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 })

  if (action === 'CLAIM') {
    if (app.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Application is not in SUBMITTED state.' }, { status: 400 })
    }
    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        reviewerId: user.id,
        status: 'UNDER_REVIEW',
      },
    })
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CLAIM_APP',
        targetType: 'Application',
        targetId: applicationId,
        details: `Claimed ${app.referenceNumber} for review`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })
    await db.notification.create({
      data: {
        userId: app.applicantId,
        title: 'Application under review',
        message: `Your application ${app.referenceNumber} is now being reviewed by the regional office.`,
        type: 'INFO',
      },
    })
    return NextResponse.json({ application: updated })
  }

  if (action === 'APPROVE') {
    if (app.status !== 'UNDER_REVIEW' && app.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Application must be under review before approval.' }, { status: 400 })
    }
    if (!app.assessmentPassed) {
      return NextResponse.json({ error: 'Cannot approve — assessment not passed.' }, { status: 400 })
    }

    const seq = await nextCertificateSequence()
    const certNumber = generateCertificateNumber(seq)
    const validUntil = new Date()
    validUntil.setFullYear(validUntil.getFullYear() + 2) // 2-year validity

    const [updated, cert] = await db.$transaction([
      db.application.update({
        where: { id: applicationId },
        data: {
          status: 'CERTIFICATE_ISSUED',
          reviewerId: user.id,
          reviewedAt: new Date(),
          decisionNote: note || 'Approved by regional officer.',
        },
      }),
      db.certificate.create({
        data: {
          certificateNumber: certNumber,
          applicationId,
          issuedById: user.id,
          validUntil,
          status: 'ACTIVE',
        },
      }),
    ])

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPROVE_APP',
        targetType: 'Application',
        targetId: applicationId,
        details: `Approved ${app.referenceNumber}. Certificate ${certNumber} issued.`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    await db.notification.create({
      data: {
        userId: app.applicantId,
        title: 'Certificate issued!',
        message: `Your Professional Competence Certificate (${certNumber}) has been issued. Valid until ${validUntil.toLocaleDateString('en-GB')}.`,
        type: 'SUCCESS',
      },
    })

    return NextResponse.json({ application: updated, certificate: cert })
  }

  if (action === 'REJECT') {
    if (app.status !== 'UNDER_REVIEW' && app.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Application is not in a reviewable state.' }, { status: 400 })
    }
    if (!note || note.trim().length < 10) {
      return NextResponse.json({ error: 'A clear rejection reason (at least 10 characters) is required.' }, { status: 400 })
    }

    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewerId: user.id,
        reviewedAt: new Date(),
        decisionNote: note,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'REJECT_APP',
        targetType: 'Application',
        targetId: applicationId,
        details: `Rejected ${app.referenceNumber}: ${note}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    await db.notification.create({
      data: {
        userId: app.applicantId,
        title: 'Application rejected',
        message: `Your application ${app.referenceNumber} was rejected. Reason: ${note}`,
        type: 'ERROR',
      },
    })

    return NextResponse.json({ application: updated })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
