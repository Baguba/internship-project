import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (session) {
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: 'LOGOUT',
        targetType: 'User',
        targetId: session.userId,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })
  }
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
