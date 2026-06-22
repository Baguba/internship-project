import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/applications/[id] - get application detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const app = await db.application.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { uploadedAt: 'desc' },
        select: { id: true, documentType: true, fileName: true, fileType: true, fileSize: true, uploadedAt: true },
      },
      applicant: {
        select: { id: true, fullName: true, email: true, phoneNumber: true, city: true, nationalId: true },
      },
      reviewer: {
        select: { id: true, fullName: true, officeName: true },
      },
      certificate: true,
    },
  })

  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (user.role === 'APPLICANT' && app.applicantId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch audit logs separately (they don't have a direct relation to Application)
  const auditLogs = await db.auditLog.findMany({
    where: { targetType: 'Application', targetId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, action: true, details: true, createdAt: true, user: { select: { fullName: true } } },
  })

  return NextResponse.json({ application: { ...app, auditLogs } })
}

// PATCH /api/applications/[id] - update application data (only when DRAFT)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const app = await db.application.findUnique({ where: { id } })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (user.role === 'APPLICANT' && app.applicantId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (app.status !== 'DRAFT') {
    return NextResponse.json({ error: 'This application has been submitted and can no longer be edited.' }, { status: 400 })
  }

  const body = await req.json()
  const allowed: string[] = [
    'fullName', 'dateOfBirth', 'gender', 'nationality', 'nationalId', 'phoneNumber',
    'email', 'region', 'city', 'woreda', 'kebele', 'addressDetail',
    'businessName', 'businessType', 'businessSector', 'businessAddress',
    'expectedStaff', 'capitalETB', 'description',
    'assessmentScore', 'assessmentTotal', 'assessmentData', 'assessmentPassed',
  ]
  const update: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in body) update[k] = body[k]
  }

  const updated = await db.application.update({
    where: { id },
    data: update,
  })

  return NextResponse.json({ application: updated })
}

// DELETE /api/applications/[id] - delete draft
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const app = await db.application.findUnique({ where: { id } })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (user.role === 'APPLICANT' && app.applicantId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (app.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Submitted applications cannot be deleted.' }, { status: 400 })
  }

  await db.application.delete({ where: { id } })
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'DELETE_APP',
      targetType: 'Application',
      targetId: id,
      details: `Deleted draft ${app.referenceNumber}`,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    },
  })

  return NextResponse.json({ ok: true })
}
