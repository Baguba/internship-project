'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Loader2, FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Plus, ArrowRight, ArrowLeft, Upload, Trash2, FileCheck, Eye,
  Award, Building2, MapPin, User as UserIcon, BookOpen, Send,
  Sparkles, Download, GraduationCap, Briefcase
} from 'lucide-react'
import { HarariStar, HarariBorder } from '@/components/harari/Decorations'
import type { CurrentUser } from '@/hooks/useAuth'
import { formatBytes, formatDate, formatDateTime, docTypeLabel, docTypeCategory, DOC_CATEGORY_LABELS } from '@/lib/helpers'
import { AssessmentRunner } from '@/components/applicant/AssessmentRunner'
import { CertificateView } from '@/components/certificate/CertificateView'

type Status = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CERTIFICATE_ISSUED'

interface ApplicationDoc {
  id: string
  documentType: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

interface Application {
  id: string
  referenceNumber: string
  fullName: string
  dateOfBirth: string
  gender: string | null
  nationality: string
  nationalId: string
  phoneNumber: string
  email: string
  region: string
  city: string
  woreda: string | null
  kebele: string | null
  addressDetail: string | null
  businessName: string
  businessType: string
  businessSector: string
  businessAddress: string
  expectedStaff: number
  capitalETB: number | null
  description: string | null
  assessmentScore: number
  assessmentTotal: number
  assessmentPassed: boolean
  status: Status
  submittedAt: string | null
  reviewedAt: string | null
  decisionNote: string | null
  createdAt: string
  updatedAt: string
  documents?: ApplicationDoc[]
  certificate?: { id: string; certificateNumber: string; status: string; validUntil: string; issuedAt: string } | null
}

type View = 'list' | 'form' | 'detail' | 'certificate'

interface ApplicantDashboardProps {
  user: CurrentUser
  onLogout: () => void
  onNavigateHome: () => void
}

export function ApplicantDashboard({ user, onLogout, onNavigateHome }: ApplicantDashboardProps) {
  const [view, setView] = useState<View>('list')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const loadApps = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/applications', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  async function handleCreateNew() {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create application')
        return
      }
      toast.success(`Application ${data.application.referenceNumber} created`)
      setSelectedApp(data.application)
      setView('form')
      loadApps()
    } catch {
      toast.error('Network error')
    }
  }

  function handleOpen(app: Application) {
    setSelectedApp(app)
    if (app.status === 'DRAFT') {
      setView('form')
    } else {
      setView('detail')
    }
  }

  async function handleOpenCertificate(app: Application) {
    setSelectedApp(app)
    setView('certificate')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={user} onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="flex-1 bg-[#FBF3E2]/40">
        <div className="container mx-auto px-4 py-8">
          {view === 'list' && (
            <ListView
              user={user}
              applications={applications}
              loading={loading}
              onCreateNew={handleCreateNew}
              onOpen={handleOpen}
              onOpenCertificate={handleOpenCertificate}
              onRefresh={loadApps}
            />
          )}
          {view === 'form' && selectedApp && (
            <FormView
              application={selectedApp}
              onSaved={(updated) => {
                setSelectedApp(updated)
                loadApps()
              }}
              onSubmitted={(updated) => {
                setSelectedApp(updated)
                setView('detail')
                loadApps()
              }}
              onCancel={() => {
                setView('list')
                loadApps()
              }}
            />
          )}
          {view === 'detail' && selectedApp && (
            <DetailView
              application={selectedApp}
              onBack={() => {
                setView('list')
                loadApps()
              }}
              onOpenCertificate={() => setView('certificate')}
            />
          )}
          {view === 'certificate' && selectedApp && (
            <CertificateView
              application={selectedApp}
              onBack={() => setView('detail')}
            />
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}

/* ============ Header / Footer shared ============ */
export function DashboardHeader({
  user, onLogout, onNavigateHome, rightExtra
}: {
  user: CurrentUser
  onLogout: () => void
  onNavigateHome: () => void
  rightExtra?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#D4A537]/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={onNavigateHome} className="flex items-center gap-3 group">
            <HarariStar size={36} />
            <div className="text-left">
              <p className="font-bold text-[#1E3A5F] leading-tight group-hover:text-[#5B2A86] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                Harari PCC Portal
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {user.role === 'APPLICANT' ? 'Applicant Dashboard' : user.role === 'REVIEWER' ? 'Reviewer Console' : 'Admin Console'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {rightExtra}
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-[#1E3A5F]">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function DashboardFooter() {
  return (
    <footer className="bg-[#1E3A5F] text-[#FBF3E2]/70 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-xs">
        © {new Date().getFullYear()} Harari Region Trade, Industry & Tourism Development Bureau · v1.0
      </div>
    </footer>
  )
}

/* ============ List View ============ */
function ListView({
  user, applications, loading, onCreateNew, onOpen, onOpenCertificate, onRefresh
}: {
  user: CurrentUser
  applications: Application[]
  loading: boolean
  onCreateNew: () => void
  onOpen: (a: Application) => void
  onOpenCertificate: (a: Application) => void
  onRefresh: () => void
}) {
  const issued = applications.filter(a => a.status === 'CERTIFICATE_ISSUED').length
  const drafts = applications.filter(a => a.status === 'DRAFT').length
  const pending = applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length

  return (
    <div className="space-y-6 fade-in-up">
      {/* Welcome banner */}
      <Card className="border-2 border-[#D4A537]/30 bg-gradient-to-br from-[#5B2A86] to-[#1E3A5F] text-white">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#D4A537]" />
              <span className="text-sm text-[#D4A537] font-semibold uppercase tracking-wider">Selam, {user.fullName.split(' ')[0]}!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Your Professional Competence Certificate applications
            </h1>
            <p className="text-[#FBF3E2]/80 text-sm mt-1">
              Manage your applications, upload documents, and track certification status.
            </p>
          </div>
          <Button onClick={onCreateNew} size="lg" className="bg-[#D4A537] hover:bg-[#B5471A] text-[#1E3A5F] font-semibold">
            <Plus className="h-4 w-4 mr-2" /> New Application
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={applications.length} icon={FileText} bg="bg-[#5B2A86]" />
        <StatCard label="Drafts" value={drafts} icon={Clock} bg="bg-[#D4A537]" />
        <StatCard label="Under Review" value={pending} icon={AlertCircle} bg="bg-[#B5471A]" />
        <StatCard label="Certificates Issued" value={issued} icon={Award} bg="bg-[#2E7A5A]" />
      </div>

      {/* Applications list */}
      <Card className="border-[#D4A537]/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#1E3A5F]">My Applications</CardTitle>
            <CardDescription>Click an application to continue or view details</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <EmptyState onCreateNew={onCreateNew} />
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <ApplicationRow key={app.id} app={app} onOpen={() => onOpen(app)} onOpenCertificate={() => onOpenCertificate(app)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, bg }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; bg: string }) {
  return (
    <Card className="border-[#D4A537]/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E3A5F]">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ApplicationRow({ app, onOpen, onOpenCertificate }: { app: Application; onOpen: () => void; onOpenCertificate: () => void }) {
  const showCert = app.status === 'CERTIFICATE_ISSUED' && app.certificate
  return (
    <div className="border border-[#D4A537]/20 rounded-lg p-4 hover:border-[#D4A537]/60 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-muted-foreground">{app.referenceNumber}</span>
          <span className={`status-pill status-${app.status}`}>{app.status.replace(/_/g, ' ')}</span>
        </div>
        <p className="font-semibold text-[#1E3A5F] truncate">{app.businessName || 'Untitled application'}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          <span><Building2 className="inline h-3 w-3 mr-1" />{app.businessType || '—'}</span>
          <span><Clock className="inline h-3 w-3 mr-1" />{formatDate(app.createdAt)}</span>
          {app.assessmentPassed && <span><CheckCircle2 className="inline h-3 w-3 mr-1 text-[#2E7A5A]" />Assessment passed</span>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {showCert ? (
          <Button size="sm" variant="outline" onClick={onOpenCertificate} className="border-[#5B2A86] text-[#5B2A86] hover:bg-[#5B2A86] hover:text-white">
            <Award className="h-3.5 w-3.5 mr-1" /> View Certificate
          </Button>
        ) : null}
        <Button size="sm" onClick={onOpen} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
          {app.status === 'DRAFT' ? 'Continue' : 'View'}
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        <HarariStar size={64} />
      </div>
      <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">No applications yet</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Start your first Professional Competence Certificate application today. The process takes
        about 20–30 minutes if you have your documents ready.
      </p>
      <Button onClick={onCreateNew} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
        <Plus className="h-4 w-4 mr-2" /> Create First Application
      </Button>
    </div>
  )
}

/* ============ Form View (multi-step) ============ */
const STEPS = [
  { id: 1, label: 'Personal', icon: UserIcon },
  { id: 2, label: 'Business', icon: Building2 },
  { id: 3, label: 'Documents', icon: FileCheck },
  { id: 4, label: 'Assessment', icon: BookOpen },
  { id: 5, label: 'Review & Submit', icon: Send },
]

function FormView({
  application, onSaved, onSubmitted, onCancel
}: {
  application: Application
  onSaved: (a: Application) => void
  onSubmitted: (a: Application) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ ...application })
  const [saving, setSaving] = useState(false)
  const [docs, setDocs] = useState<ApplicationDoc[]>(application.documents || [])
  const [submitting, setSubmitting] = useState(false)

  // Fetch fresh application detail (including documents) when component mounts
  // or when application.id changes (i.e. user opens a different application).
  // We intentionally do NOT react to all parent prop changes here, because the
  // parent's list response does not include documents and would overwrite our
  // doc state.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/applications/${application.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (cancelled || !data.application) return
        setForm({ ...data.application })
        setDocs(data.application.documents || [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [application.id])

  async function saveField(fields: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save')
        return false
      }
      setForm({ ...form, ...fields } as Application)
      onSaved(data.application)
      return true
    } catch {
      toast.error('Network error')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function reloadDocs() {
    const res = await fetch(`/api/documents?appId=${application.id}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setDocs(data.documents || [])
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/applications/${application.id}/submit`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Submission failed')
        if (data.missing) {
          toast.error(`Missing: ${data.missing.join(', ')}`)
        }
        return
      }
      toast.success('Application submitted successfully!')
      onSubmitted(data.application)
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (step / STEPS.length) * 100

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-[#5B2A86] mb-2 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to applications
          </button>
          <h1 className="text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
            {application.businessName || 'New Application'}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{application.referenceNumber}</p>
        </div>
        <div className="text-right">
          <span className={`status-pill status-${application.status}`}>{application.status.replace(/_/g, ' ')}</span>
          <p className="text-xs text-muted-foreground mt-1">Last updated: {formatDateTime(application.updatedAt)}</p>
        </div>
      </div>

      {/* Stepper */}
      <Card className="border-[#D4A537]/30">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => s.id < step && setStep(s.id)}
                    disabled={s.id > step}
                    className={`flex items-center gap-2 ${s.id < step ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                      done ? 'bg-[#2E7A5A] text-white' :
                      active ? 'bg-[#5B2A86] text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className={`text-xs font-semibold ${active ? 'text-[#5B2A86]' : 'text-muted-foreground'}`}>
                        Step {s.id}
                      </p>
                      <p className={`text-sm ${active ? 'text-[#1E3A5F]' : 'text-muted-foreground'}`}>{s.label}</p>
                    </div>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full ${done ? 'bg-[#2E7A5A]' : 'bg-muted'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Step content */}
      {step === 1 && (
        <PersonalStep form={form} setForm={setForm} onSave={saveField} saving={saving} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <BusinessStep form={form} setForm={setForm} onSave={saveField} saving={saving} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      )}
      {step === 3 && (
        <DocumentsStep appId={application.id} docs={docs} onReload={reloadDocs} onBack={() => setStep(2)} onNext={() => setStep(4)} />
      )}
      {step === 4 && (
        <AssessmentRunner
          application={application}
          onPassed={(score, total) => {
            saveField({ assessmentScore: score, assessmentTotal: total, assessmentPassed: true })
            setStep(5)
          }}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <ReviewStep form={form} docs={docs} onBack={() => setStep(4)} onSubmit={handleSubmit} submitting={submitting} />
      )}
    </div>
  )
}

/* ============ Step 1: Personal ============ */
function PersonalStep({
  form, setForm, onSave, saving, onNext
}: {
  form: Application
  setForm: (f: Application) => void
  onSave: (f: Record<string, unknown>) => Promise<boolean>
  saving: boolean
  onNext: () => void
}) {
  const [local, setLocal] = useState({ ...form })

  function update(k: keyof Application, v: string | number | null) {
    setLocal({ ...local, [k]: v })
    setForm({ ...local, [k]: v } as Application)
  }

  async function handleNext() {
    const required = ['fullName', 'dateOfBirth', 'nationalId', 'phoneNumber', 'email', 'city']
    for (const k of required) {
      const v = (local as Record<string, unknown>)[k]
      if (!v || (typeof v === 'string' && !v.trim())) {
        toast.error(`Please fill in all required fields.`)
        return
      }
    }
    const ok = await onSave({
      fullName: local.fullName,
      dateOfBirth: local.dateOfBirth,
      gender: local.gender,
      nationality: local.nationality,
      nationalId: local.nationalId,
      phoneNumber: local.phoneNumber,
      email: local.email,
      region: local.region,
      city: local.city,
      woreda: local.woreda,
      kebele: local.kebele,
      addressDetail: local.addressDetail,
    })
    if (ok) onNext()
  }

  return (
    <Card className="border-[#D4A537]/30 fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]"><UserIcon className="h-5 w-5 text-[#5B2A86]" /> Personal Information</CardTitle>
        <CardDescription>Tell us about yourself. This must match your National ID.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Full Name *">
            <Input value={local.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="As it appears on your ID" />
          </Field>
          <Field label="Date of Birth *">
            <Input type="date" value={local.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Gender">
            <Select value={local.gender || ''} onValueChange={(v) => update('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nationality">
            <Input value={local.nationality} onChange={(e) => update('nationality', e.target.value)} />
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="National ID Number *">
            <Input value={local.nationalId} onChange={(e) => update('nationalId', e.target.value)} placeholder="Federal ID" />
          </Field>
          <Field label="Phone Number *">
            <Input value={local.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="+2519..." />
          </Field>
        </div>
        <Field label="Email *">
          <Input type="email" value={local.email} onChange={(e) => update('email', e.target.value)} />
        </Field>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Region">
            <Input value={local.region} onChange={(e) => update('region', e.target.value)} />
          </Field>
          <Field label="City *">
            <Input value={local.city} onChange={(e) => update('city', e.target.value)} placeholder="Harar" />
          </Field>
          <Field label="Woreda">
            <Input value={local.woreda || ''} onChange={(e) => update('woreda', e.target.value)} placeholder="Jugol" />
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Kebele">
            <Input value={local.kebele || ''} onChange={(e) => update('kebele', e.target.value)} placeholder="e.g., 04" />
          </Field>
          <Field label="House / Address detail">
            <Input value={local.addressDetail || ''} onChange={(e) => update('addressDetail', e.target.value)} placeholder="House number, street" />
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleNext} disabled={saving} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save & Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ============ Step 2: Business ============ */
function BusinessStep({
  form, setForm, onSave, saving, onBack, onNext
}: {
  form: Application
  setForm: (f: Application) => void
  onSave: (f: Record<string, unknown>) => Promise<boolean>
  saving: boolean
  onBack: () => void
  onNext: () => void
}) {
  const [local, setLocal] = useState({ ...form })

  function update(k: keyof Application, v: string | number | null) {
    setLocal({ ...local, [k]: v })
    setForm({ ...local, [k]: v } as Application)
  }

  async function handleNext() {
    const required = ['businessName', 'businessType', 'businessSector', 'businessAddress']
    for (const k of required) {
      const v = (local as Record<string, unknown>)[k]
      if (!v || (typeof v === 'string' && !v.trim())) {
        toast.error(`Please fill in all required fields.`)
        return
      }
    }
    const ok = await onSave({
      businessName: local.businessName,
      businessType: local.businessType,
      businessSector: local.businessSector,
      businessAddress: local.businessAddress,
      expectedStaff: Number(local.expectedStaff) || 1,
      capitalETB: local.capitalETB ? Number(local.capitalETB) : null,
      description: local.description,
    })
    if (ok) onNext()
  }

  return (
    <Card className="border-[#D4A537]/30 fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]"><Building2 className="h-5 w-5 text-[#5B2A86]" /> Business Information</CardTitle>
        <CardDescription>Tell us about the business you want to open in the Harari Region.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Business Name *">
          <Input value={local.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="e.g., Harar Coffee House" />
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Business Type *">
            <Select value={local.businessType} onValueChange={(v) => update('businessType', v)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Trade">Trade / Retail</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Hospitality">Hospitality / Tourism</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Business Sector *">
            <Select value={local.businessSector} onValueChange={(v) => update('businessSector', v)}>
              <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Retail">Retail / General Trade</SelectItem>
                <SelectItem value="Textile & Fashion">Textile & Fashion</SelectItem>
                <SelectItem value="Coffee & Spices">Coffee & Spices (Harar specialty)</SelectItem>
                <SelectItem value="Handicrafts">Handicrafts</SelectItem>
                <SelectItem value="Transport & Logistics">Transport & Logistics</SelectItem>
                <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                <SelectItem value="Education & Training">Education & Training</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Business Address *">
          <Textarea value={local.businessAddress} onChange={(e) => update('businessAddress', e.target.value)} placeholder="Full address where the business will operate" rows={2} />
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Expected Number of Staff">
            <Input type="number" min={1} value={local.expectedStaff} onChange={(e) => update('expectedStaff', Number(e.target.value))} />
          </Field>
          <Field label="Capital (ETB)">
            <Input type="number" min={0} value={local.capitalETB ?? ''} onChange={(e) => update('capitalETB', e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 50000" />
          </Field>
        </div>
        <Field label="Business Description">
          <Textarea value={local.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="Briefly describe your business, products, and services" rows={4} />
        </Field>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <Button onClick={handleNext} disabled={saving} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save & Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ============ Step 3: Documents ============ */
const DOC_TYPES = [
  // Identity (required)
  { value: 'NATIONAL_ID', label: 'National ID *', desc: 'Your federal ID card (front + back). Required.', required: true },
  // Business documents
  { value: 'BUSINESS_PLAN', label: 'Business Plan *', desc: 'A brief business plan (1-3 pages). Required.', required: true },
  { value: 'TIN', label: 'TIN Certificate', desc: 'Taxpayer Identification Number certificate from ERCA (if already registered)', required: false },
  { value: 'LEASE_AGREEMENT', label: 'Lease / Property Agreement', desc: 'Proof of business premises (rental contract or ownership document)', required: false },
  { value: 'BANK_STATEMENT', label: 'Bank Statement', desc: 'Last 3 months of bank statements (optional, strengthens application)', required: false },
  // Educational - Ethiopian system
  { value: 'GRADE_8_CERT', label: 'Grade 8 Completion Certificate', desc: 'Primary school leaving certificate (8th grade national exam result)', required: false },
  { value: 'GRADE_10_CERT', label: 'Grade 10 Certificate (EGECE)', desc: 'Ethiopian General Secondary Education Certificate Examination result', required: false },
  { value: 'GRADE_12_CERT', label: 'Grade 12 Certificate (EHEECE / Matric)', desc: 'Ethiopian Higher Education Entrance Certificate Examination result (matric)', required: false },
  { value: 'TVET_CERT', label: 'TVET Certificate', desc: 'Technical & Vocational Education and Training certificate (Levels I-V)', required: false },
  { value: 'DIPLOMA', label: 'Diploma', desc: 'College diploma (e.g., from a public or private college, typically 2-3 years)', required: false },
  { value: 'ADVANCED_DIPLOMA', label: 'Advanced Diploma', desc: 'Advanced diploma from a recognized institution', required: false },
  { value: 'BACHELOR_DEGREE', label: 'Bachelor Degree', desc: 'University degree (BSc, BA, LLB, etc.) from a recognized university', required: false },
  { value: 'MASTERS_DEGREE', label: 'Master\'s Degree', desc: 'Postgraduate degree (MSc, MA, MBA, etc.)', required: false },
  { value: 'PHD_DEGREE', label: 'Doctorate (PhD)', desc: 'Doctoral degree from a recognized university', required: false },
  { value: 'PROFESSIONAL_CERT', label: 'Professional Certification', desc: 'Professional qualification (e.g., ACCA, CPA, Cisco, Microsoft, teaching license)', required: false },
  { value: 'TRADE_LICENSE', label: 'Previous Trade License', desc: 'Previous business license (if you have operated a business before)', required: false },
  { value: 'WORK_EXPERIENCE', label: 'Work Experience Letter', desc: 'Letter from previous employer(s) confirming relevant work experience', required: false },
  { value: 'HEALTH_CERT', label: 'Health Certificate', desc: 'Sanitary permit / health certificate — required for food-related businesses', required: false },
  { value: 'OTHER', label: 'Other Document', desc: 'Any additional supporting document not listed above', required: false },
]

function DocumentsStep({
  appId, docs, onReload, onBack, onNext
}: {
  appId: string
  docs: ApplicationDoc[]
  onReload: () => void
  onBack: () => void
  onNext: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('NATIONAL_ID')

  async function handleUpload(file: File) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum 5 MB.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('applicationId', appId)
      fd.append('documentType', selectedType)
      fd.append('file', file)
      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }
      toast.success(`${file.name} uploaded`)
      onReload()
    } catch {
      toast.error('Network error')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this document?')) return
    const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Document removed')
      onReload()
    } else {
      toast.error('Failed to delete')
    }
  }

  function handleView(doc: ApplicationDoc) {
    // Open file in new window
    fetch(`/api/documents?id=${doc.id}`)
      .then(r => r.json())
      .then(data => {
        const bin = atob(data.document.fileData)
        const arr = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
        const blob = new Blob([arr], { type: data.document.fileType })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      })
      .catch(() => toast.error('Failed to load document'))
  }

  const hasNationalId = docs.some(d => d.documentType === 'NATIONAL_ID')
  const hasBusinessPlan = docs.some(d => d.documentType === 'BUSINESS_PLAN')
  const canProceed = hasNationalId && hasBusinessPlan

  return (
    <Card className="border-[#D4A537]/30 fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]"><FileCheck className="h-5 w-5 text-[#5B2A86]" /> Document Upload</CardTitle>
        <CardDescription>
          Upload the required documents. National ID and Business Plan are mandatory.
          Accepted formats: PDF, JPG, PNG, DOCX. Max size: 5 MB each.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload area */}
        <div className="border-2 border-dashed border-[#D4A537]/40 rounded-lg p-6 bg-[#FFFBF0]/40">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1">
              <Label className="mb-1.5 block">Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                {DOC_TYPES.find(t => t.value === selectedType)?.desc}
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              <span className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#5B2A86] text-white rounded-md hover:bg-[#4A1F6E] font-medium text-sm">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Choose File'}
              </span>
            </label>
          </div>
        </div>

        {/* Required checklist */}
        <div className="grid md:grid-cols-2 gap-3">
          <RequirementCard ok={hasNationalId} label="National ID uploaded" />
          <RequirementCard ok={hasBusinessPlan} label="Business Plan uploaded" />
        </div>

        {/* Uploaded documents */}
            {/* Uploaded documents grouped by category */}
        <div>
          <h4 className="font-semibold text-[#1E3A5F] mb-3">Uploaded Documents ({docs.length})</h4>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Group documents by category */}
              {Object.entries(
                docs.reduce((acc, doc) => {
                  const cat = docTypeCategory(doc.documentType)
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(doc)
                  return acc
                }, {} as Record<string, typeof docs>)
              ).map(([cat, catDocs]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    {cat === 'identity' && <UserIcon className="h-3.5 w-3.5 text-[#5B2A86]" />}
                    {cat === 'business' && <Building2 className="h-3.5 w-3.5 text-[#B5471A]" />}
                    {cat === 'education' && <GraduationCap className="h-3.5 w-3.5 text-[#2E7A5A]" />}
                    {cat === 'experience' && <Briefcase className="h-3.5 w-3.5 text-[#D4A537]" />}
                    {cat === 'other' && <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {DOC_CATEGORY_LABELS[cat] || cat} ({catDocs.length})
                    </p>
                  </div>
                  <div className="space-y-2 ml-5 border-l-2 border-[#D4A537]/20 pl-3">
                    {catDocs.map(doc => (
                      <div key={doc.id} className="border border-[#D4A537]/20 rounded-lg p-3 flex items-center gap-3 hover:bg-[#FFFBF0]/40">
                        <FileText className="h-8 w-8 text-[#5B2A86] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1E3A5F] truncate">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            <Badge variant="outline" className="mr-2 text-[10px]">{docTypeLabel(doc.documentType)}</Badge>
                            {formatBytes(doc.fileSize)} · {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleView(doc)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <Button onClick={onNext} disabled={!canProceed} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
            Continue to Assessment <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        {!canProceed && (
          <p className="text-xs text-destructive text-center">Please upload at least the National ID and Business Plan to continue.</p>
        )}
      </CardContent>
    </Card>
  )
}

function RequirementCard({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${ok ? 'border-[#2E7A5A]/40 bg-[#2E7A5A]/5' : 'border-[#B5471A]/40 bg-[#B5471A]/5'}`}>
      {ok ? <CheckCircle2 className="h-5 w-5 text-[#2E7A5A]" /> : <XCircle className="h-5 w-5 text-[#B5471A]" />}
      <span className="text-sm">{label}</span>
    </div>
  )
}

/* ============ Step 5: Review & Submit ============ */
function ReviewStep({
  form, docs, onBack, onSubmit, submitting
}: {
  form: Application
  docs: ApplicationDoc[]
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
}) {
  return (
    <Card className="border-[#D4A537]/30 fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]"><Send className="h-5 w-5 text-[#5B2A86]" /> Review & Submit</CardTitle>
        <CardDescription>Review all your information before submitting. Once submitted, you cannot edit the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal */}
        <div>
          <h4 className="font-semibold text-[#5B2A86] mb-3 flex items-center gap-2"><UserIcon className="h-4 w-4" /> Personal Information</h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewItem label="Full Name" value={form.fullName} />
            <ReviewItem label="Date of Birth" value={form.dateOfBirth} />
            <ReviewItem label="National ID" value={form.nationalId} />
            <ReviewItem label="Phone" value={form.phoneNumber} />
            <ReviewItem label="Email" value={form.email} />
            <ReviewItem label="City" value={`${form.city}${form.woreda ? `, ${form.woreda}` : ''}${form.kebele ? ` Kebele ${form.kebele}` : ''}`} />
          </div>
        </div>

        <Separator />

        {/* Business */}
        <div>
          <h4 className="font-semibold text-[#5B2A86] mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> Business Information</h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewItem label="Business Name" value={form.businessName} />
            <ReviewItem label="Type" value={form.businessType} />
            <ReviewItem label="Sector" value={form.businessSector} />
            <ReviewItem label="Expected Staff" value={String(form.expectedStaff)} />
            <ReviewItem label="Capital (ETB)" value={form.capitalETB ? form.capitalETB.toLocaleString() : '—'} />
            <ReviewItem label="Address" value={form.businessAddress} />
          </div>
          {form.description && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{form.description}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Documents */}
        <div>
          <h4 className="font-semibold text-[#5B2A86] mb-3 flex items-center gap-2"><FileCheck className="h-4 w-4" /> Documents ({docs.length})</h4>
          <div className="space-y-1">
            {docs.map(d => (
              <div key={d.id} className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7A5A]" />
                <span>{d.fileName}</span>
                <Badge variant="outline" className="text-[10px]">{d.documentType.replace(/_/g, ' ')}</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Assessment */}
        <div>
          <h4 className="font-semibold text-[#5B2A86] mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Assessment</h4>
          <div className="flex items-center gap-3 p-3 bg-[#2E7A5A]/10 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-[#2E7A5A]" />
            <div>
              <p className="font-semibold text-[#2E7A5A]">Passed</p>
              <p className="text-sm text-muted-foreground">
                Score: {form.assessmentScore}/{form.assessmentTotal} ({Math.round((form.assessmentScore / Math.max(form.assessmentTotal, 1)) * 100)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#D4A537]/10 border border-[#D4A537]/40 rounded-lg p-4">
          <p className="text-sm text-[#1E3A5F]">
            <AlertCircle className="inline h-4 w-4 mr-1 text-[#B5471A]" />
            By submitting, you confirm that all information provided is true and accurate.
            Submitting false information may result in rejection and possible legal action under
            Ethiopian law.
          </p>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <Button onClick={onSubmit} disabled={submitting} className="bg-[#2E7A5A] hover:bg-[#236347]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-[#1E3A5F]">{value || '—'}</p>
    </div>
  )
}

/* ============ Field helper ============ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

/* ============ Detail View (for submitted apps) ============ */
function DetailView({
  application, onBack, onOpenCertificate
}: {
  application: Application
  onBack: () => void
  onOpenCertificate: () => void
}) {
  const [docs, setDocs] = useState<ApplicationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<{ id: string; action: string; details: string | null; createdAt: string; user: { fullName: string } | null }[]>([])

  useEffect(() => {
    fetch(`/api/applications/${application.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.application) {
          setDocs(data.application.documents || [])
          setTimeline(data.application.auditLogs || [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [application.id])

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-[#5B2A86] mb-2 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to applications
          </button>
          <h1 className="text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
            {application.businessName}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{application.referenceNumber}</p>
        </div>
        <div className="text-right">
          <span className={`status-pill status-${application.status}`}>{application.status.replace(/_/g, ' ')}</span>
          {application.status === 'CERTIFICATE_ISSUED' && application.certificate && (
            <Button onClick={onOpenCertificate} className="ml-2 bg-[#5B2A86] hover:bg-[#4A1F6E]" size="sm">
              <Award className="h-3.5 w-3.5 mr-1" /> View Certificate
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal */}
          <Card className="border-[#D4A537]/30">
            <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><UserIcon className="h-4 w-4 text-[#5B2A86]" /> Applicant</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <ReviewItem label="Full Name" value={application.fullName} />
              <ReviewItem label="National ID" value={application.nationalId} />
              <ReviewItem label="Phone" value={application.phoneNumber} />
              <ReviewItem label="Email" value={application.email} />
              <ReviewItem label="City" value={`${application.city}${application.woreda ? `, ${application.woreda}` : ''}`} />
              <ReviewItem label="Date of Birth" value={application.dateOfBirth} />
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="border-[#D4A537]/30">
            <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><Building2 className="h-4 w-4 text-[#5B2A86]" /> Business</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <ReviewItem label="Business Name" value={application.businessName} />
              <ReviewItem label="Type" value={application.businessType} />
              <ReviewItem label="Sector" value={application.businessSector} />
              <ReviewItem label="Staff" value={String(application.expectedStaff)} />
              <ReviewItem label="Capital (ETB)" value={application.capitalETB ? application.capitalETB.toLocaleString() : '—'} />
              <ReviewItem label="Address" value={application.businessAddress} />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-[#D4A537]/30">
            <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><FileCheck className="h-4 w-4 text-[#5B2A86]" /> Documents</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-20 animate-pulse bg-muted rounded" />
              ) : docs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No documents.</p>
              ) : (
                <div className="space-y-2">
                  {docs.map(d => (
                    <div key={d.id} className="flex items-center gap-3 text-sm border border-[#D4A537]/20 rounded-lg p-2">
                      <FileText className="h-5 w-5 text-[#5B2A86]" />
                      <span className="flex-1 truncate">{d.fileName}</span>
                      <Badge variant="outline" className="text-[10px]">{d.documentType.replace(/_/g, ' ')}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviewer decision */}
          {application.decisionNote && (
            <Card className={`border-2 ${application.status === 'REJECTED' ? 'border-[#B5471A]/40 bg-[#B5471A]/5' : 'border-[#2E7A5A]/40 bg-[#2E7A5A]/5'}`}>
              <CardHeader><CardTitle className="text-base flex items-center gap-2">
                {application.status === 'REJECTED' ? <XCircle className="h-4 w-4 text-[#B5471A]" /> : <CheckCircle2 className="h-4 w-4 text-[#2E7A5A]" />}
                Reviewer Decision
              </CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{application.decisionNote}</p>
                {application.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">Reviewed on {formatDateTime(application.reviewedAt)}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Card className="border-[#D4A537]/30 sticky top-20">
            <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><Clock className="h-4 w-4 text-[#5B2A86]" /> Timeline</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-40 animate-pulse bg-muted rounded" />
              ) : timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No activity recorded.</p>
              ) : (
                <ol className="relative border-l-2 border-[#D4A537]/30 ml-3 space-y-4">
                  {timeline.map((t, i) => (
                    <li key={t.id} className="ml-4">
                      <div className={`absolute -left-[7px] h-3 w-3 rounded-full ${i === 0 ? 'bg-[#D4A537]' : 'bg-[#5B2A86]/40'}`} />
                      <p className="text-sm font-medium text-[#1E3A5F]">{actionLabel(t.action)}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)} · {t.user?.fullName || 'System'}</p>
                      {t.details && <p className="text-xs text-muted-foreground mt-0.5">{t.details}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    CREATE_APP: 'Application created',
    SUBMIT_APP: 'Application submitted',
    CLAIM_APP: 'Claimed for review',
    APPROVE_APP: 'Approved & certificate issued',
    REJECT_APP: 'Application rejected',
    DELETE_APP: 'Deleted',
  }
  return map[action] || action
}
