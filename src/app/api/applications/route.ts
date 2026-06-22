import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateReferenceNumber, nextReferenceSequence } from '@/lib/helpers'

// GET: list current user's applications
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (user.role === 'APPLICANT') {
    const apps = await db.application.findMany({
      where: { applicantId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { documents: true } },
        certificate: true,
      },
    })
    return NextResponse.json({ applications: apps })
  }

  // REVIEWER / ADMIN: see all submitted
  const apps = await db.application.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CERTIFICATE_ISSUED'] },
    },
    orderBy: { submittedAt: 'desc' },
    include: {
      applicant: {
        select: { id: true, fullName: true, email: true, phoneNumber: true, city: true },
      },
      _count: { select: { documents: true } },
      certificate: true,
    },
  })
  return NextResponse.json({ applications: apps })
}

// POST: create a new draft application
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'APPLICANT') {
    return NextResponse.json({ error: 'Only applicants can create applications.' }, { status: 403 })
  }

  try {
    const body = await req.json()

    const seq = await nextReferenceSequence()
    const referenceNumber = generateReferenceNumber(seq)

    // Pre-fill personal info from profile
    const app = await db.application.create({
      data: {
        referenceNumber,
        applicantId: user.id,
        fullName: body.fullName || user.fullName,
        dateOfBirth: body.dateOfBirth || '',
        gender: body.gender || null,
        nationality: body.nationality || 'Ethiopian',
        nationalId: body.nationalId || user.nationalId || '',
        phoneNumber: body.phoneNumber || user.phoneNumber || '',
        email: body.email || user.email,
        region: body.region || user.region || 'Harari',
        city: body.city || user.city || '',
        woreda: body.woreda || user.woreda || null,
        kebele: body.kebele || user.kebele || null,
        addressDetail: body.addressDetail || null,
        businessName: body.businessName || '',
        businessType: body.businessType || '',
        businessSector: body.businessSector || '',
        businessAddress: body.businessAddress || '',
        expectedStaff: body.expectedStaff || 1,
        capitalETB: body.capitalETB ?? null,
        description: body.description || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_APP',
        targetType: 'Application',
        targetId: app.id,
        details: `Created draft ${referenceNumber}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ application: app })
  } catch (e) {
    console.error('create app error', e)
    return NextResponse.json({ error: 'Failed to create application.' }, { status: 500 })
  }
}
