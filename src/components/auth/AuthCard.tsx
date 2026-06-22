'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, User as UserIcon, Phone, MapPin, Building2, Briefcase, FileText } from 'lucide-react'
import { HarariBorder, HarariStar } from '@/components/harari/Decorations'

interface AuthCardProps {
  onAuthenticated: () => void
}

export function AuthCard({ onAuthenticated }: AuthCardProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regRole, setRegRole] = useState<'APPLICANT' | 'REVIEWER'>('APPLICANT')
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    nationalId: '',
    region: 'Harari',
    city: '',
    woreda: '',
    kebele: '',
    officeName: '',
    jobTitle: '',
  })
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your email and password.')
      return
    }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`)
      onAuthenticated()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regForm.fullName || !regForm.email || !regForm.password) {
      toast.error('Full name, email, and password are required.')
      return
    }
    if (regForm.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (regRole === 'REVIEWER' && (!regForm.officeName || !regForm.jobTitle)) {
      toast.error('Reviewers must provide their office name and job title.')
      return
    }
    setRegLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...regForm, role: regRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }
      toast.success(`Account created. Welcome, ${data.user.fullName.split(' ')[0]}!`)
      onAuthenticated()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-2 border-[#D4A537]/30 overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-br from-[#5B2A86] to-[#1E3A5F] text-white pb-8 pt-8 relative">
        <div className="absolute inset-0 opacity-20 harari-textile" />
        <div className="relative">
          <div className="flex justify-center mb-2">
            <HarariStar size={48} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Harari PCC Portal
          </CardTitle>
          <CardDescription className="text-[#FBF3E2]/90 mt-1">
            Professional Competence Certificate
          </CardDescription>
          <HarariBorder className="opacity-80" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full bg-[#5B2A86] hover:bg-[#4A1F6E]">
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>

              {/* <div className="rounded-lg border border-[#D4A537]/30 bg-[#FBF3E2]/40 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-[#5B2A86] mb-1">Demo Accounts:</p>
                <p>Applicant: <code className="text-[#B5471A]">applicant@example.com</code> / <code>Applicant@2026</code></p>
                <p>Reviewer: <code className="text-[#B5471A]">reviewer@hararipcc.gov.et</code> / <code>Reviewer@2026</code></p>
                <p>Admin: <code className="text-[#B5471A]">admin@hararipcc.gov.et</code> / <code>Admin@2026</code></p>
              </div> */}

              
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>I am registering as a:</Label>
                <Select value={regRole} onValueChange={(v) => setRegRole(v as 'APPLICANT' | 'REVIEWER')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPLICANT">Applicant (Business Owner)</SelectItem>
                    <SelectItem value="REVIEWER">Regional Officer / Reviewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="reg-name" value={regForm.fullName} onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })} className="pl-9" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="reg-email" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="pl-9" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password (min 6 chars)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="reg-password" type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className="pl-9" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-phone" value={regForm.phoneNumber} onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })} className="pl-9" placeholder="+2519..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-national-id">National ID</Label>
                  <Input id="reg-national-id" value={regForm.nationalId} onChange={(e) => setRegForm({ ...regForm, nationalId: e.target.value })} placeholder="Federal ID number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-city" value={regForm.city} onChange={(e) => setRegForm({ ...regForm, city: e.target.value })} className="pl-9" placeholder="Harar" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-woreda">Woreda</Label>
                  <Input id="reg-woreda" value={regForm.woreda} onChange={(e) => setRegForm({ ...regForm, woreda: e.target.value })} placeholder="Jugol" />
                </div>
              </div>

              {regRole === 'REVIEWER' && (
                <div className="space-y-3 border-t pt-3 border-[#D4A537]/30">
                  <p className="text-sm font-semibold text-[#5B2A86]">Officer Information</p>
                  <div className="space-y-2">
                    <Label htmlFor="reg-office">Office Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-office" value={regForm.officeName} onChange={(e) => setRegForm({ ...regForm, officeName: e.target.value })} className="pl-9" placeholder="Harari Trade, Industry & Tourism Bureau" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-job">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-job" value={regForm.jobTitle} onChange={(e) => setRegForm({ ...regForm, jobTitle: e.target.value })} className="pl-9" placeholder="Senior Licensing Officer" />
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={regLoading} className="w-full bg-[#5B2A86] hover:bg-[#4A1F6E]">
                {regLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-[#FBF3E2]/40 border-t border-[#D4A537]/20 px-6 py-3">
        <p className="text-xs text-center text-muted-foreground w-full">
          <FileText className="inline h-3 w-3 mr-1" />
          Harari Region Trade, Industry & Tourism Development Bureau
        </p>
      </CardFooter>
    </Card>
  )
}
