import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signSession, setSessionCookie } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, password, fullName, phoneNumber, nationalId, role,
      region, city, woreda, kebele, officeName, jobTitle,
    } = body || {}

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password and full name are required.' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }
    if (!['APPLICANT', 'REVIEWER'].includes(role || '')) {
      return NextResponse.json({ error: 'Invalid role selected.' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    if (nationalId) {
      const byId = await db.user.findUnique({ where: { nationalId } })
      if (byId) {
        return NextResponse.json({ error: 'An account with this National ID already exists.' }, { status: 409 })
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        email, passwordHash, fullName, phoneNumber, nationalId, role,
        region: region || 'Harari', city, woreda, kebele,
        officeName: role === 'REVIEWER' ? officeName : null,
        jobTitle: role === 'REVIEWER' ? jobTitle : null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, action: 'REGISTER', targetType: 'User',
        targetId: user.id, details: `New ${role} registered: ${email}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    const token = await signSession({
      userId: user.id, email: user.email, role: user.role, name: user.fullName,
    })
    await setSessionCookie(token)

    return NextResponse.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    })
  } catch (e: unknown) {
    console.error('register error', e)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}