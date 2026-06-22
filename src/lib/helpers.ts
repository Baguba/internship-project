// Reference number & certificate number generators
export function generateReferenceNumber(seq: number, year: number = new Date().getFullYear()): string {
  // HRS-PCC-2026-0001
  const padded = String(seq).padStart(4, '0')
  return `HRS-PCC-${year}-${padded}`
}

export function generateCertificateNumber(seq: number, year: number = new Date().getFullYear()): string {
  const padded = String(seq).padStart(4, '0')
  return `HRS-PCC-CERT-${year}-${padded}`
}

export async function nextReferenceSequence(): Promise<number> {
  // Count existing apps this year
  const { db } = await import('./db')
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const count = await db.application.count({
    where: { createdAt: { gte: yearStart } },
  })
  return count + 1
}

export async function nextCertificateSequence(): Promise<number> {
  const { db } = await import('./db')
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const count = await db.certificate.count({
    where: { issuedAt: { gte: yearStart } },
  })
  return count + 1
}

// File helpers
export function bytesToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary) // works in Node 18+
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Prettify document type codes into human-readable labels
const DOC_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: 'National ID',
  BUSINESS_PLAN: 'Business Plan',
  TIN: 'TIN Certificate',
  LEASE_AGREEMENT: 'Lease / Property Agreement',
  BANK_STATEMENT: 'Bank Statement',
  TRADE_LICENSE: 'Previous Trade License',
  GRADE_8_CERT: 'Grade 8 Certificate',
  GRADE_10_CERT: 'Grade 10 Certificate (EGECE)',
  GRADE_12_CERT: 'Grade 12 Certificate (Matric)',
  TVET_CERT: 'TVET Certificate',
  DIPLOMA: 'Diploma',
  ADVANCED_DIPLOMA: 'Advanced Diploma',
  BACHELOR_DEGREE: 'Bachelor Degree',
  MASTERS_DEGREE: "Master's Degree",
  PHD_DEGREE: 'Doctorate (PhD)',
  PROFESSIONAL_CERT: 'Professional Certification',
  WORK_EXPERIENCE: 'Work Experience Letter',
  HEALTH_CERT: 'Health Certificate',
  EDUCATION: 'Education Certificate',
  PHOTO: 'Photo',
  OTHER: 'Other Document',
}

const DOC_TYPE_CATEGORY: Record<string, 'identity' | 'business' | 'education' | 'experience' | 'other'> = {
  NATIONAL_ID: 'identity',
  BUSINESS_PLAN: 'business',
  TIN: 'business',
  LEASE_AGREEMENT: 'business',
  BANK_STATEMENT: 'business',
  TRADE_LICENSE: 'business',
  GRADE_8_CERT: 'education',
  GRADE_10_CERT: 'education',
  GRADE_12_CERT: 'education',
  TVET_CERT: 'education',
  DIPLOMA: 'education',
  ADVANCED_DIPLOMA: 'education',
  BACHELOR_DEGREE: 'education',
  MASTERS_DEGREE: 'education',
  PHD_DEGREE: 'education',
  PROFESSIONAL_CERT: 'education',
  EDUCATION: 'education',
  WORK_EXPERIENCE: 'experience',
  HEALTH_CERT: 'other',
  PHOTO: 'other',
  OTHER: 'other',
}

export function docTypeLabel(code: string): string {
  return DOC_TYPE_LABELS[code] || code.replace(/_/g, ' ')
}

export function docTypeCategory(code: string): string {
  return DOC_TYPE_CATEGORY[code] || 'other'
}

export const DOC_CATEGORY_LABELS: Record<string, string> = {
  identity: 'Identity Documents',
  business: 'Business Documents',
  education: 'Educational Certificates',
  experience: 'Work Experience',
  other: 'Other Documents',
}