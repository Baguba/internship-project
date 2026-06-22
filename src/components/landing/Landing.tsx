'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HarariStar, HarariBorder, HarariGeoPattern } from '@/components/harari/Decorations'
import {
  FileText, ShieldCheck, Building2, Clock, CheckCircle2, MapPin,
  Award, ArrowRight, BookOpen, Users, Bell, Lock
} from 'lucide-react'

interface LandingProps {
  onApply: () => void
  onLogin: () => void
}

export function Landing({ onApply, onLogin }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader onLogin={onLogin} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden hero-gradient text-white">
          <HarariGeoPattern className="absolute inset-0 opacity-20" opacity={0.2} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm border border-[#D4A537]/50">
                  <MapPin className="h-3.5 w-3.5 text-[#D4A537]" />
                  <span className="text-[#FBF3E2]">Harari People Regional State · Ethiopia</span>
                </div>
                <h1
                  className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Get Certified to <span className="text-[#D4A537]">Open Your Business</span> in the Harari Region
                </h1>
                <p className="text-lg text-[#FBF3E2]/90 max-w-xl">
                  The official online portal of the Harari Region Trade, Industry & Tourism Development
                  Bureau. Submit your documents, pass the competence assessment, and receive your
                  Professional Competence Certificate (PCC) — all online.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={onApply}
                    className="bg-[#D4A537] hover:bg-[#B5471A] text-[#1E3A5F] font-semibold"
                  >
                    Start Application <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onLogin}
                    className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white"
                  >
                    Sign In to Portal
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6 pt-6 text-sm">
                  <div>
                    <div className="text-3xl font-bold text-[#D4A537]" style={{ fontFamily: 'var(--font-display)' }}>5</div>
                    <div className="text-[#FBF3E2]/80">Business days</div>
                  </div>
                  <div className="border-l border-white/20 pl-6">
                    <div className="text-3xl font-bold text-[#D4A537]" style={{ fontFamily: 'var(--font-display)' }}>100%</div>
                    <div className="text-[#FBF3E2]/80">Online process</div>
                  </div>
                  <div className="border-l border-white/20 pl-6">
                    <div className="text-3xl font-bold text-[#D4A537]" style={{ fontFamily: 'var(--font-display)' }}>2 Yrs</div>
                    <div className="text-[#FBF3E2]/80">Certificate validity</div>
                  </div>
                </div>
              </div>

              {/* Visual: stylized certificate mock */}
              <div className="relative fade-in-up">
                <div className="absolute -inset-4 harari-textile rounded-2xl opacity-20" />
                <Card className="relative bg-[#FFFBF0] text-[#1E3A5F] border-4 border-[#D4A537]/40 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-3">
                      <HarariStar size={56} />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#5B2A86]/70 mb-2">Professional Competence Certificate</p>
                    <HarariBorder />
                    <p className="text-sm text-muted-foreground mb-1">This is to certify that</p>
                    <p className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Yusuf Ibrahim</p>
                    <p className="text-sm text-muted-foreground mb-4">has been duly examined and found competent to operate</p>
                    <p className="text-lg font-semibold text-[#B5471A]">"Harar Coffee House"</p>
                    <p className="text-sm text-muted-foreground mt-1">Retail · Food & Beverage</p>
                    <HarariBorder />
                    <div className="flex justify-between items-end text-xs mt-2">
                      <div className="text-left">
                        <p className="font-semibold text-[#5B2A86]">Certificate No.</p>
                        <p>HRS-PCC-CERT-2026-0001</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#5B2A86]">Valid Until</p>
                        <p>21 Jun 2028</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Color stripe at bottom */}
          <div className="harari-stripe h-2" />
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24 bg-[#FBF3E2]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#5B2A86]/10 px-4 py-1 text-sm text-[#5B2A86] mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>How It Works</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
                Four Steps to Your Certificate
              </h2>
              <p className="text-muted-foreground">
                From registration to certificate, the entire process is designed to be transparent,
                fast, and accessible to every Harari entrepreneur.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <Card key={i} className="relative border-2 border-[#D4A537]/20 hover:border-[#D4A537]/60 hover:shadow-lg transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${step.bg}`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-5xl font-bold text-[#D4A537]/20" style={{ fontFamily: 'var(--font-display)' }}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-[#1E3A5F]">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#B5471A]/10 px-4 py-1 text-sm text-[#B5471A] mb-3">
                <Award className="h-3.5 w-3.5" />
                <span>Why Choose Our Portal</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
                Built for Harari Entrepreneurs
              </h2>
              <p className="text-muted-foreground">
                A modern, secure, and culturally rooted platform tailored for the Harari Region's
                unique business landscape.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <Card key={i} className="border border-[#D4A537]/20 hover:shadow-md transition-shadow bg-[#FFFBF0]/40">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-[#5B2A86]/10 flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5 text-[#5B2A86]" />
                    </div>
                    <h3 className="font-bold mb-2 text-[#1E3A5F]">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 harari-pattern-purple text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <HarariStar size={56} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to start your business journey in Harari?
            </h2>
            <p className="text-[#FBF3E2]/80 max-w-xl mx-auto mb-8">
              Create your account today and begin your Professional Competence Certificate application
              in minutes.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" onClick={onApply} className="bg-[#D4A537] hover:bg-[#B5471A] text-[#1E3A5F] font-semibold">
                Start Your Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={onLogin} className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white">
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function SiteHeader({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#D4A537]/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <HarariStar size={36} />
            <div>
              <p className="font-bold text-[#1E3A5F] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Harari PCC Portal
              </p>
              <p className="text-xs text-muted-foreground leading-tight">Professional Competence Certificate</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how-it-works" className="text-muted-foreground hover:text-[#5B2A86] transition-colors">How It Works</a>
            <a href="#features" className="text-muted-foreground hover:text-[#5B2A86] transition-colors">Features</a>
            <a href="#about" className="text-muted-foreground hover:text-[#5B2A86] transition-colors">About</a>
          </nav>
          <Button onClick={onLogin} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-[#1E3A5F] text-[#FBF3E2]/80 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <HarariStar size={28} />
              <p className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>Harari PCC Portal</p>
            </div>
            <p className="text-sm">
              The official Professional Competence Certificate portal of the Harari People Regional
              State, Ethiopia. Operated by the Trade, Industry & Tourism Development Bureau.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Contact</p>
            <ul className="text-sm space-y-1.5">
              <li>Harar, Harari People Regional State</li>
              <li>phone: +251 25 666 1234</li>
              <li>email: pcc@harariregion.gov.et</li>
              <li>office hours: Mon–Fri, 8:30 – 17:00</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Quick Links</p>
            <ul className="text-sm space-y-1.5">
              <li>Business registration guide</li>
              <li>Required documents checklist</li>
              <li>Frequently asked questions</li>
              <li>Verify a certificate</li>
            </ul>
          </div>
        </div>
        <div className="harari-stripe h-1 my-6 rounded-full" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-[#FBF3E2]/60">
          <p>© {new Date().getFullYear()} Harari Region Trade, Industry & Tourism Development Bureau. All rights reserved.</p>
          <p>Built with Next.js, Prisma & Tailwind CSS · v1.0</p>
        </div>
      </div>
    </footer>
  )
}

const STEPS = [
  {
    title: 'Register & Create Profile',
    desc: 'Sign up with your national ID and contact information. Set up your applicant profile once — reuse it for future renewals.',
    icon: Users,
    bg: 'bg-[#5B2A86]',
  },
  {
    title: 'Submit Documents',
    desc: 'Upload your National ID, business plan, and supporting documents. All files are encrypted and stored securely.',
    icon: FileText,
    bg: 'bg-[#D4A537]',
  },
  {
    title: 'Pass the Assessment',
    desc: 'Take the 17-question competence assessment covering business registration, tax, labour law, and consumer protection in Ethiopia.',
    icon: BookOpen,
    bg: 'bg-[#B5471A]',
  },
  {
    title: 'Get Reviewed & Certified',
    desc: 'A regional officer reviews your application. Upon approval, your PCC is issued instantly — valid for 2 years.',
    icon: Award,
    bg: 'bg-[#2E7A5A]',
  },
]

const FEATURES = [
  {
    title: 'Fully Online Process',
    desc: 'Apply from anywhere — Harar, Dire Dawa, or abroad. No need to visit a physical office during the initial stages.',
    icon: Clock,
  },
  {
    title: 'Secure Document Storage',
    desc: 'All uploaded documents are encrypted at rest. Access is restricted to you and authorized regional officers only.',
    icon: Lock,
  },
  {
    title: 'Competence Assessment',
    desc: 'A tailored 17-question assessment on Ethiopian business law, taxation, and Harari regional regulations ensures only qualified entrepreneurs are certified.',
    icon: ShieldCheck,
  },
  {
    title: 'Real-time Status Tracking',
    desc: 'Track your application through every stage: Draft → Submitted → Under Review → Approved → Certificate Issued.',
    icon: Bell,
  },
  {
    title: 'Verifiable Certificates',
    desc: 'Every issued certificate has a unique number. Customers and partners can verify its authenticity instantly via the public verification portal.',
    icon: CheckCircle2,
  },
  {
    title: 'Regional Compliance',
    desc: 'Built specifically for the Harari Region. Aligned with regional trade bureau regulations and federal Ethiopian law.',
    icon: Building2,
  },
]
