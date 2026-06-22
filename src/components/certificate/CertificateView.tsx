'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Download, Printer, ShieldCheck, GraduationCap } from 'lucide-react'
import { HarariStar, HarariBorder, HarariCorner } from '@/components/harari/Decorations'
import { formatDate, docTypeLabel, docTypeCategory } from '@/lib/helpers'

interface CertificateViewProps {
  application: {
    id: string
    referenceNumber: string
    fullName: string
    nationalId: string
    businessName: string
    businessType: string
    businessSector: string
    businessAddress: string
    city: string
    region: string
    certificate?: {
      id: string
      certificateNumber: string
      status: string
      issuedAt: string
      validUntil: string
    } | null
  }
  /** Optional: list of educational qualification labels to display on the certificate.
   *  If not provided, the component will try to fetch them from the application's documents. */
  qualifications?: string[]
  onBack: () => void
}

export function CertificateView({ application, qualifications: providedQualifications, onBack }: CertificateViewProps) {
  const cert = application.certificate
  const [fetchedQualifications, setFetchedQualifications] = useState<string[]>(providedQualifications || [])

  // If qualifications weren't passed as a prop, fetch the application's documents
  // and extract the educational ones.
  useEffect(() => {
    if (providedQualifications && providedQualifications.length > 0) return
    let cancelled = false
    fetch(`/api/applications/${application.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (cancelled || !data.application?.documents) return
        const eduDocs = data.application.documents.filter(
          (d: any) => docTypeCategory(d.documentType) === 'education'
        )
        const labels = eduDocs.map((d: any) => docTypeLabel(d.documentType))
        // Deduplicate
        setFetchedQualifications(Array.from(new Set(labels)))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [application.id, providedQualifications])

  if (!cert) {
    return (
      <Card className="border-[#B5471A]/40">
        <CardContent className="p-6 text-center">
          <p>No certificate found for this application.</p>
          <Button onClick={onBack} variant="outline" className="mt-3">Back</Button>
        </CardContent>
      </Card>
    )
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Toolbar (hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-[#5B2A86] flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} size="sm">
            <Printer className="h-3.5 w-3.5 mr-1" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div className="certificate-page">
        <div className="certificate-bg rounded-lg shadow-2xl border-4 border-[#D4A537]/60 p-6 md:p-12 relative overflow-hidden">
          {/* Corner ornaments */}
          <HarariCorner className="absolute top-0 left-0 text-[#D4A537]/60" size={70} />
          <HarariCorner className="absolute top-0 right-0 rotate-90 text-[#D4A537]/60" size={70} />
          <HarariCorner className="absolute bottom-0 right-0 rotate-180 text-[#D4A537]/60" size={70} />
          <HarariCorner className="absolute bottom-0 left-0 -rotate-90 text-[#D4A537]/60" size={70} />

          {/* Inner border */}
          <div className="border-2 border-[#5B2A86]/30 p-6 md:p-10 relative">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <HarariStar size={64} />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#5B2A86] font-semibold mb-1">
                Harari People Regional State
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Trade, Industry & Tourism Development Bureau
              </p>
              <h1
                className="text-2xl md:text-4xl font-bold text-[#1E3A5F] mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Professional Competence Certificate
              </h1>
              <HarariBorder />
            </div>

            {/* Body */}
            <div className="text-center space-y-3 my-6 md:my-8">
              <p className="text-sm text-muted-foreground">This is to certify that</p>
              <p
                className="text-2xl md:text-3xl font-bold text-[#5B2A86]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {application.fullName}
              </p>
              <p className="text-sm text-muted-foreground">
                National ID: <span className="font-mono font-semibold text-[#1E3A5F]">{application.nationalId}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                has been duly examined and found competent to operate
              </p>
              <p
                className="text-xl md:text-2xl font-bold text-[#B5471A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                "{application.businessName}"
              </p>
              <p className="text-sm text-muted-foreground">
                {application.businessType} · {application.businessSector}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                located at {application.businessAddress}, {application.city}, {application.region} Region
              </p>

              {/* Educational qualifications (if any) */}
              {fetchedQualifications.length > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2E7A5A]/10 border border-[#2E7A5A]/30">
                  <GraduationCap className="h-3.5 w-3.5 text-[#2E7A5A]" />
                  <span className="text-xs text-muted-foreground">Qualifications verified:</span>
                  <span className="text-xs font-semibold text-[#2E7A5A]">
                    {fetchedQualifications.join(' · ')}
                  </span>
                </div>
              )}
            </div>

            <HarariBorder />

            {/* Footer */}
            <div className="grid grid-cols-2 gap-6 mt-6 md:mt-8 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate Number</p>
                <p className="font-mono font-bold text-[#1E3A5F]">{cert.certificateNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">Issued: {formatDate(cert.issuedAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Valid Until</p>
                <p className="font-mono font-bold text-[#1E3A5F]">{formatDate(cert.validUntil)}</p>
                <p className="text-xs text-muted-foreground mt-2">Reference: {application.referenceNumber}</p>
              </div>
            </div>

            {/* Signature line */}
            <div className="grid grid-cols-2 gap-6 mt-8 md:mt-12 text-xs">
              <div className="text-center">
                <div className="border-t border-[#5B2A86]/40 pt-1 mx-4">
                  <p className="font-semibold text-[#1E3A5F]">Applicant Signature</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-[#5B2A86]/40 pt-1 mx-4">
                  <p className="font-semibold text-[#1E3A5F]">Issuing Officer</p>
                  <p className="text-muted-foreground">Harari Trade Bureau</p>
                </div>
              </div>
            </div>

            {/* Verification footer */}
            <div className="mt-6 text-center text-xs text-muted-foreground border-t border-[#D4A537]/30 pt-3">
              <ShieldCheck className="inline h-3 w-3 mr-1" />
              Verify this certificate at <span className="font-semibold text-[#5B2A86]">hararipcc.gov.et/verify</span> using the certificate number above.
              <br />
              This certificate is issued under the authority of the Harari People Regional State
              Trade, Industry & Tourism Development Bureau.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}