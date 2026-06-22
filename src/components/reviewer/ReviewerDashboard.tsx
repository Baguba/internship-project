'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Loader2, FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Eye, Search, Filter, Award, Building2, User as UserIcon,
  TrendingUp, Users, BellRing, Activity, Gavel, FileCheck,
  ArrowLeft, ExternalLink, Download, GraduationCap, Briefcase
} from 'lucide-react'
import { HarariStar, HarariBorder } from '@/components/harari/Decorations'
import type { CurrentUser } from '@/hooks/useAuth'
import { DashboardHeader } from '@/components/applicant/ApplicantDashboard'
import { formatDate, formatDateTime, docTypeLabel, docTypeCategory, DOC_CATEGORY_LABELS } from '@/lib/helpers'
import { CertificateView } from '@/components/certificate/CertificateView'

type Status = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CERTIFICATE_ISSUED'

interface ReviewApp {
  id: string
  referenceNumber: string
  status: Status
  fullName: string
  email: string
  phoneNumber: string | null
  city: string | null
  businessName: string
  businessType: string
  businessSector: string
  submittedAt: string | null
  reviewedAt: string | null
  decisionNote: string | null
  assessmentPassed: boolean
  assessmentScore: number
  assessmentTotal: number
  reviewer: { id: string; fullName: string; officeName: string | null } | null
  applicant: { id: string; fullName: string; email: string; phoneNumber: string | null; city: string | null }
  _count: { documents: number }
  certificate: { id: string; certificateNumber: string; status: string } | null
}

interface Stats {
  counts: {
    totalApplications: number
    draft: number
    submitted: number
    underReview: number
    approved: number
    rejected: number
    issued: number
    certificates: number
    activeCertificates: number
    applicants: number
    staff: number
  }
  recentActivity: {
    id: string
    action: string
    details: string | null
    createdAt: string
    user: { fullName: string } | null
  }[]
  sectorBreakdown: { sector: string; count: number }[]
}

type View = 'queue' | 'detail' | 'certificate'

export function ReviewerDashboard({
  user, onLogout, onNavigateHome
}: {
  user: CurrentUser
  onLogout: () => void
  onNavigateHome: () => void
}) {
  const [view, setView] = useState<View>('queue')
  const [apps, setApps] = useState<ReviewApp[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedApp, setSelectedApp] = useState<ReviewApp | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  const loadApps = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/review', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setApps(data.applications || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (res.ok) setStats(await res.json())
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    loadApps()
    loadStats()
  }, [loadApps, loadStats])

  function refresh() {
    loadApps()
    loadStats()
  }

  function handleOpen(app: ReviewApp) {
    setSelectedApp(app)
    setView('detail')
  }

  const filteredApps = apps.filter(a => {
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        a.referenceNumber.toLowerCase().includes(s) ||
        a.fullName.toLowerCase().includes(s) ||
        a.businessName.toLowerCase().includes(s) ||
        a.email.toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={user} onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="flex-1 bg-[#FBF3E2]/40">
        <div className="container mx-auto px-4 py-8">
          {view === 'queue' && (
            <div className="space-y-6 fade-in-up">
              {/* Welcome */}
              <Card className="border-2 border-[#D4A537]/30 bg-gradient-to-br from-[#5B2A86] to-[#1E3A5F] text-white">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Gavel className="h-4 w-4 text-[#D4A537]" />
                      <span className="text-sm text-[#D4A537] font-semibold uppercase tracking-wider">Reviewer Console</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      Selam, {user.fullName}
                    </h1>
                    <p className="text-[#FBF3E2]/80 text-sm mt-1">
                      {user.officeName || 'Harari Region Trade, Industry & Tourism Development Bureau'}
                      {user.jobTitle ? ` · ${user.jobTitle}` : ''}
                    </p>
                  </div>
                  <Button onClick={refresh} variant="outline" className="bg-white/10 text-white border-white/40 hover:bg-white/20">
                    Refresh
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <StatBox label="Pending Review" value={stats.counts.submitted + stats.counts.underReview} icon={Clock} bg="bg-[#B5471A]" />
                  <StatBox label="Issued" value={stats.counts.issued} icon={Award} bg="bg-[#2E7A5A]" />
                  <StatBox label="Rejected" value={stats.counts.rejected} icon={XCircle} bg="bg-[#B5471A]" />
                  <StatBox label="Active Certs" value={stats.counts.activeCertificates} icon={ShieldIcon} bg="bg-[#5B2A86]" />
                  <StatBox label="Applicants" value={stats.counts.applicants} icon={Users} bg="bg-[#D4A537]" textDark />
                  <StatBox label="Total Apps" value={stats.counts.totalApplications} icon={FileText} bg="bg-[#1E3A5F]" />
                </div>
              )}

              {/* Filters + Queue */}
              <Card className="border-[#D4A537]/30">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-[#1E3A5F]">Application Queue</CardTitle>
                      <CardDescription>Review and approve incoming PCC applications</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search name, business, ref..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All statuses</SelectItem>
                          <SelectItem value="SUBMITTED">Submitted</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="CERTIFICATE_ISSUED">Issued</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />)}
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="flex justify-center mb-3"><HarariStar size={48} /></div>
                      <p className="text-muted-foreground">No applications match your filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredApps.map(app => (
                        <ReviewAppRow key={app.id} app={app} onOpen={() => handleOpen(app)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sector breakdown */}
              {stats && stats.sectorBreakdown.length > 0 && (
                <Card className="border-[#D4A537]/30">
                  <CardHeader>
                    <CardTitle className="text-[#1E3A5F] flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#5B2A86]" /> Certificates Issued by Sector</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.sectorBreakdown.map((s, i) => {
                        const max = Math.max(...stats.sectorBreakdown.map(x => x.count))
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm w-40 shrink-0 text-[#1E3A5F]">{s.sector}</span>
                            <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#5B2A86] to-[#D4A537] flex items-center justify-end pr-2"
                                style={{ width: `${(s.count / max) * 100}%` }}
                              >
                                <span className="text-xs text-white font-semibold">{s.count}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent activity */}
              {stats && stats.recentActivity.length > 0 && (
                <Card className="border-[#D4A537]/30">
                  <CardHeader>
                    <CardTitle className="text-[#1E3A5F] flex items-center gap-2"><Activity className="h-5 w-5 text-[#5B2A86]" /> Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentActivity.map(a => (
                        <div key={a.id} className="flex items-center gap-3 text-sm border-b border-[#D4A537]/10 pb-2 last:border-0 last:pb-0">
                          <div className="h-2 w-2 rounded-full bg-[#5B2A86]" />
                          <div className="flex-1">
                            <p className="text-[#1E3A5F]">
                              <span className="font-semibold">{a.user?.fullName || 'System'}</span> · {a.action.replace(/_/g, ' ').toLowerCase()}
                            </p>
                            {a.details && <p className="text-xs text-muted-foreground">{a.details}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {view === 'detail' && selectedApp && (
            <ReviewDetailView
              app={selectedApp}
              onBack={() => {
                setView('queue')
                refresh()
              }}
              onOpenCertificate={() => setView('certificate')}
              onActionComplete={() => {
                refresh()
              }}
            />
          )}

          {view === 'certificate' && selectedApp && (
            <ReviewerCertificateView appId={selectedApp.id} onBack={() => setView('detail')} />
          )}
        </div>
      </main>

      <footer className="bg-[#1E3A5F] text-[#FBF3E2]/70 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs">
          © {new Date().getFullYear()} Harari Region Trade, Industry & Tourism Development Bureau · v1.0
        </div>
      </footer>
    </div>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />
}

function ReviewerCertificateView({ appId, onBack }: { appId: string; onBack: () => void }) {
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/applications/${appId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setApp(data.application)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [appId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B2A86]" />
      </div>
    )
  }
  if (!app || !app.certificate) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="mb-3">No certificate found for this application.</p>
          <Button onClick={onBack} variant="outline">Back</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <CertificateView
      application={{
        id: app.id,
        referenceNumber: app.referenceNumber,
        fullName: app.fullName,
        nationalId: app.nationalId,
        businessName: app.businessName,
        businessType: app.businessType,
        businessSector: app.businessSector,
        businessAddress: app.businessAddress,
        city: app.city,
        region: app.region,
        certificate: app.certificate,
      }}
      onBack={onBack}
    />
  )
}

function StatBox({ label, value, icon: Icon, bg, textDark }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; bg: string; textDark?: boolean }) {
  return (
    <Card className="border-[#D4A537]/20">
      <CardContent className="p-3">
        <div className={`h-8 w-8 rounded ${bg} flex items-center justify-center mb-2`}>
          <Icon className={`h-4 w-4 ${textDark ? 'text-[#1E3A5F]' : 'text-white'}`} />
        </div>
        <p className="text-xl font-bold text-[#1E3A5F]">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function ReviewAppRow({ app, onOpen }: { app: ReviewApp; onOpen: () => void }) {
  return (
    <div className="border border-[#D4A537]/20 rounded-lg p-3 hover:border-[#D4A537]/60 hover:shadow-sm transition-all flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground">{app.referenceNumber}</span>
          <span className={`status-pill status-${app.status}`}>{app.status.replace(/_/g, ' ')}</span>
          {app.assessmentPassed && <Badge variant="outline" className="text-[10px] text-[#2E7A5A]">Assessment passed</Badge>}
          {app.certificate && <Badge variant="outline" className="text-[10px] text-[#5B2A86]">{app.certificate.certificateNumber}</Badge>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div>
            <p className="font-semibold text-[#1E3A5F] truncate">{app.businessName || '—'}</p>
            <p className="text-xs text-muted-foreground truncate">{app.applicant.fullName} · {app.applicant.email}</p>
          </div>
          <div className="text-xs text-muted-foreground md:text-right">
            <p><Building2 className="inline h-3 w-3 mr-1" />{app.businessType} · {app.businessSector}</p>
            <p><Clock className="inline h-3 w-3 mr-1" />Submitted: {formatDate(app.submittedAt)}</p>
          </div>
        </div>
      </div>
      <Button size="sm" onClick={onOpen} className="bg-[#5B2A86] hover:bg-[#4A1F6E] shrink-0">
        Review <Eye className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  )
}

function ReviewDetailView({
  app, onBack, onOpenCertificate, onActionComplete
}: {
  app: ReviewApp
  onBack: () => void
  onOpenCertificate: () => void
  onActionComplete: () => void
}) {
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  useEffect(() => {
    fetch(`/api/applications/${app.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setDetail(data.application)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [app.id])

  async function handleAction(action: 'CLAIM' | 'APPROVE' | 'REJECT', note?: string) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id, action, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Action failed')
        return
      }
      if (action === 'CLAIM') {
        toast.success('Application claimed. You can now approve or reject.')
      } else if (action === 'APPROVE') {
        toast.success(`Approved! Certificate ${data.certificate?.certificateNumber} issued.`)
      } else {
        toast.success('Application rejected.')
      }
      onActionComplete()
      onBack()
    } catch {
      toast.error('Network error')
    } finally {
      setActionLoading(false)
      setRejectDialog(false)
    }
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-[#5B2A86] mb-2 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
          </button>
          <h1 className="text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
            {app.businessName}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{app.referenceNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-pill status-${app.status}`}>{app.status.replace(/_/g, ' ')}</span>
          {app.certificate && (
            <Button onClick={onOpenCertificate} variant="outline" size="sm" className="border-[#5B2A86] text-[#5B2A86]">
              <Award className="h-3.5 w-3.5 mr-1" /> View Certificate
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-96 animate-pulse bg-muted rounded-lg" />
      ) : detail ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant */}
            <Card className="border-[#D4A537]/30">
              <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><UserIcon className="h-4 w-4 text-[#5B2A86]" /> Applicant</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Full Name" value={detail.fullName} />
                <Field label="National ID" value={detail.nationalId} />
                <Field label="Phone" value={detail.phoneNumber} />
                <Field label="Email" value={detail.email} />
                <Field label="Date of Birth" value={detail.dateOfBirth} />
                <Field label="City" value={`${detail.city}${detail.woreda ? `, ${detail.woreda}` : ''}${detail.kebele ? ` Kebele ${detail.kebele}` : ''}`} />
              </CardContent>
            </Card>

            {/* Business */}
            <Card className="border-[#D4A537]/30">
              <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><Building2 className="h-4 w-4 text-[#5B2A86]" /> Business</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Business Name" value={detail.businessName} />
                <Field label="Type" value={detail.businessType} />
                <Field label="Sector" value={detail.businessSector} />
                <Field label="Staff" value={String(detail.expectedStaff)} />
                <Field label="Capital (ETB)" value={detail.capitalETB ? Number(detail.capitalETB).toLocaleString() : '—'} />
                <Field label="Address" value={detail.businessAddress} />
              </CardContent>
              {detail.description && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{detail.description}</p>
                </CardContent>
              )}
            </Card>

            {/* Assessment */}
            <Card className="border-[#D4A537]/30">
              <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><FileCheck className="h-4 w-4 text-[#5B2A86]" /> Assessment</CardTitle></CardHeader>
              <CardContent>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${detail.assessmentPassed ? 'bg-[#2E7A5A]/10' : 'bg-[#B5471A]/10'}`}>
                  {detail.assessmentPassed ? <CheckCircle2 className="h-6 w-6 text-[#2E7A5A]" /> : <XCircle className="h-6 w-6 text-[#B5471A]" />}
                  <div>
                    <p className={`font-semibold ${detail.assessmentPassed ? 'text-[#2E7A5A]' : 'text-[#B5471A]'}`}>
                      {detail.assessmentPassed ? 'Passed' : 'Not passed'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Score: {detail.assessmentScore}/{detail.assessmentTotal} ({Math.round((detail.assessmentScore / Math.max(detail.assessmentTotal, 1)) * 100)}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

                      {/* Educational Qualifications Summary */}
            {detail.documents?.some((d: any) => docTypeCategory(d.documentType) === 'education') && (
              <Card className="border-[#2E7A5A]/30 bg-[#2E7A5A]/5">
                <CardHeader>
                  <CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#2E7A5A]" /> Educational Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {detail.documents
                      .filter((d: any) => docTypeCategory(d.documentType) === 'education')
                      .map((d: any) => (
                        <Badge key={d.id} className="bg-[#2E7A5A]/15 text-[#2E7A5A] border-[#2E7A5A]/30 hover:bg-[#2E7A5A]/20">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {docTypeLabel(d.documentType)}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click any document below to view the certificate.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Documents grouped by category */}
            <Card className="border-[#D4A537]/30">
              <CardHeader><CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><FileText className="h-4 w-4 text-[#5B2A86]" /> Documents ({detail.documents?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                {detail.documents?.length ? (
                  <div className="space-y-4">
                    {Object.entries(
                      (detail.documents as any[]).reduce((acc, doc) => {
                        const cat = docTypeCategory(doc.documentType)
                        if (!acc[cat]) acc[cat] = []
                        acc[cat].push(doc)
                        return acc
                      }, {} as Record<string, any[]>)
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
                          {catDocs.map((d: any) => (
                            <DocumentRow key={d.id} doc={d} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No documents uploaded.</p>
                )}
              </CardContent>
            </Card>
            {/* Reviewer note if any */}
            {detail.decisionNote && (
              <Card className={`border-2 ${detail.status === 'REJECTED' ? 'border-[#B5471A]/40' : 'border-[#2E7A5A]/40'}`}>
                <CardHeader><CardTitle className="text-base">Previous Decision Note</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{detail.decisionNote}</p></CardContent>
              </Card>
            )}
          </div>

          {/* Action panel */}
          <div>
            <Card className="border-[#D4A537]/30 sticky top-20">
              <CardHeader>
                <CardTitle className="text-base text-[#1E3A5F] flex items-center gap-2"><Gavel className="h-4 w-4 text-[#5B2A86]" /> Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.status === 'SUBMITTED' && (
                  <Button
                    onClick={() => handleAction('CLAIM')}
                    disabled={actionLoading}
                    className="w-full bg-[#1E3A5F] hover:bg-[#15294a]"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
                    Claim for Review
                  </Button>
                )}

                {app.status === 'UNDER_REVIEW' && (
                  <>
                    <Button
                      onClick={() => handleAction('APPROVE')}
                      disabled={actionLoading || !detail.assessmentPassed}
                      className="w-full bg-[#2E7A5A] hover:bg-[#236347]"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Approve & Issue Certificate
                    </Button>
                    {!detail.assessmentPassed && (
                      <p className="text-xs text-destructive text-center">Cannot approve — assessment not passed.</p>
                    )}
                    <Button
                      onClick={() => setRejectDialog(true)}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full border-[#B5471A] text-[#B5471A] hover:bg-[#B5471A] hover:text-white"
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject Application
                    </Button>
                  </>
                )}

                {(app.status === 'CERTIFICATE_ISSUED' || app.status === 'REJECTED') && (
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      This application has been {app.status === 'CERTIFICATE_ISSUED' ? 'approved' : 'rejected'}.
                    </p>
                  </div>
                )}

                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Submitted: {formatDateTime(detail.submittedAt)}</p>
                  {detail.reviewer && (
                    <p>Reviewer: {detail.reviewer.fullName}{detail.reviewer.officeName ? ` (${detail.reviewer.officeName})` : ''}</p>
                  )}
                  {detail.reviewedAt && <p>Reviewed: {formatDateTime(detail.reviewedAt)}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Reject dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1E3A5F]">Reject Application</DialogTitle>
            <DialogDescription>
              Provide a clear reason for rejecting this application. The applicant will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">Rejection Reason (min 10 chars)</Label>
            <Textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g., Business plan lacks required details. Please resubmit with detailed financial projections."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button
              onClick={() => handleAction('REJECT', rejectNote)}
              disabled={actionLoading || rejectNote.trim().length < 10}
              className="bg-[#B5471A] hover:bg-[#8a3713]"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-[#1E3A5F]">{value || '—'}</p>
    </div>
  )
}

function DocumentRow({ doc }: { doc: any }) {
  const [loading, setLoading] = useState(false)

  function handleView() {
    setLoading(true)
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
      .finally(() => setLoading(false))
  }

  return (
    <div className="flex items-center gap-3 border border-[#D4A537]/20 rounded-lg p-2">
      <FileText className="h-5 w-5 text-[#5B2A86] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-[#1E3A5F]">{doc.fileName}</p>
               <Badge variant="outline" className="text-[10px]">{docTypeLabel(doc.documentType)}</Badge>
      </div>
      <Button size="sm" variant="ghost" onClick={handleView} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
