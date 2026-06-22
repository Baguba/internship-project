import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signSession, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }
    if (!user.isActive) {
      return NextResponse.json({ error: 'This account has been deactivated. Contact the regional office.' }, { status: 403 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        targetType: 'User',
        targetId: user.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    const token = await signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.fullName,
    })
    await setSessionCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        region: user.region,
        city: user.city,
      },
    })
  } catch (e) {
    console.error('login error', e)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
