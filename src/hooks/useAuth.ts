'use client'

import { useCallback, useEffect, useState } from 'react'

export interface CurrentUser {
  id: string
  email: string
  fullName: string
  role: 'APPLICANT' | 'REVIEWER' | 'ADMIN'
  phoneNumber: string | null
  nationalId: string | null
  region: string
  city: string | null
  woreda: string | null
  kebele: string | null
  officeName: string | null
  jobTitle: string | null
  isActive: boolean
}

export function useAuth() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return { user, loading, refresh, logout, setUser }
}
