import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/notifications - list user's notifications
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  const unreadCount = await db.notification.count({ where: { userId: user.id, read: false } })
  return NextResponse.json({ notifications, unreadCount })
}

// POST /api/notifications - mark one (or all) as read
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (body.markAll) {
    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })
    return NextResponse.json({ ok: true })
  }
  if (body.id) {
    await db.notification.update({
      where: { id: body.id, userId: user.id },
      data: { read: true },
    })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Provide id or markAll=true' }, { status: 400 })
}
