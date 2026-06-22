import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/admin/stats - dashboard stats for reviewers/admins
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    totalApplications,
    draftCount,
    submittedCount,
    underReviewCount,
    approvedCount,
    rejectedCount,
    issuedCount,
    totalCertificates,
    activeCertificates,
    totalApplicants,
    totalReviewers,
    recentActivity,
    sectorBreakdown,
  ] = await Promise.all([
    db.application.count(),
    db.application.count({ where: { status: 'DRAFT' } }),
    db.application.count({ where: { status: 'SUBMITTED' } }),
    db.application.count({ where: { status: 'UNDER_REVIEW' } }),
    db.application.count({ where: { status: 'APPROVED' } }),
    db.application.count({ where: { status: 'REJECTED' } }),
    db.application.count({ where: { status: 'CERTIFICATE_ISSUED' } }),
    db.certificate.count(),
    db.certificate.count({ where: { status: 'ACTIVE' } }),
    db.user.count({ where: { role: 'APPLICANT' } }),
    db.user.count({ where: { role: { in: ['REVIEWER', 'ADMIN'] } } }),
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true } } },
    }),
    db.application.groupBy({
      by: ['businessSector'],
      where: { status: 'CERTIFICATE_ISSUED' },
      _count: true,
    }),
  ])

  return NextResponse.json({
    counts: {
      totalApplications,
      draft: draftCount,
      submitted: submittedCount,
      underReview: underReviewCount,
      approved: approvedCount,
      rejected: rejectedCount,
      issued: issuedCount,
      certificates: totalCertificates,
      activeCertificates,
      applicants: totalApplicants,
      staff: totalReviewers,
    },
    recentActivity,
    sectorBreakdown: sectorBreakdown.map(s => ({ sector: s.businessSector || 'Unknown', count: s._count })),
  })
}
