import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/certificates - list user's certificates (or all for reviewers)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const verifyNumber = searchParams.get('verify')

  // Public verification endpoint: GET /api/certificates?verify=HRS-PCC-CERT-2026-0001
  if (verifyNumber) {
    const cert = await db.certificate.findUnique({
      where: { certificateNumber: verifyNumber.toUpperCase() },
      include: {
        application: {
          select: {
            fullName: true,
            nationalId: true,
            businessName: true,
            businessType: true,
            businessAddress: true,
            referenceNumber: true,
            city: true,
          },
        },
        issuedBy: { select: { fullName: true, officeName: true, jobTitle: true } },
      },
    })
    if (!cert) {
      return NextResponse.json({ valid: false, error: 'Certificate number not found.' }, { status: 404 })
    }
    return NextResponse.json({
      valid: cert.status === 'ACTIVE' && cert.validUntil > new Date(),
      certificate: {
        certificateNumber: cert.certificateNumber,
        issuedAt: cert.issuedAt,
        validUntil: cert.validUntil,
        status: cert.status,
        application: cert.application,
        issuedBy: cert.issuedBy,
      },
    })
  }

  // Authenticated list
  let where = {}
  if (user.role === 'APPLICANT') {
    where = {
      application: { applicantId: user.id },
    }
  }

  const certificates = await db.certificate.findMany({
    where,
    orderBy: { issuedAt: 'desc' },
    include: {
      application: {
        select: {
          id: true, referenceNumber: true, fullName: true, nationalId: true,
          businessName: true, businessType: true, businessSector: true, businessAddress: true,
          city: true, region: true,
        },
      },
      issuedBy: { select: { id: true, fullName: true, officeName: true, jobTitle: true } },
    },
  })

  return NextResponse.json({ certificates })
}
