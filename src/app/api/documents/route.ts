import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const ALLOWED_TYPES = [
  // Identity
  'NATIONAL_ID',
  // Business documents
  'BUSINESS_PLAN', 'TIN', 'LEASE_AGREEMENT', 'BANK_STATEMENT', 'TRADE_LICENSE',
  // Educational - Ethiopian system
  'GRADE_8_CERT', 'GRADE_10_CERT', 'GRADE_12_CERT', 'TVET_CERT',
  'DIPLOMA', 'ADVANCED_DIPLOMA', 'BACHELOR_DEGREE', 'MASTERS_DEGREE', 'PHD_DEGREE',
  'PROFESSIONAL_CERT',
  // Experience & other
  'WORK_EXPERIENCE', 'HEALTH_CERT', 'EDUCATION', 'OTHER',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// POST: upload document
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'APPLICANT') {
    return NextResponse.json({ error: 'Only applicants can upload documents.' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const applicationId = formData.get('applicationId') as string
    const documentType = formData.get('documentType') as string
    const file = formData.get('file') as File | null

    if (!applicationId || !documentType || !file) {
      return NextResponse.json({ error: 'applicationId, documentType and file are required.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type.' }, { status: 400 })
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}. Use PDF, JPG, PNG, or DOCX.` }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 5 MB.' }, { status: 400 })
    }

    const app = await db.application.findUnique({ where: { id: applicationId } })
    if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    if (app.applicantId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (app.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Cannot upload to a submitted application.' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const base64 = buf.toString('base64')

    const doc = await db.document.create({
      data: {
        applicationId,
        documentType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64,
      },
    })

    return NextResponse.json({
      document: {
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
      },
    })
  } catch (e) {
    console.error('upload error', e)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}

// GET /api/documents?appId=...&id=... - list docs (metadata) or fetch one (with fileData)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const appId = searchParams.get('appId')
  const docId = searchParams.get('id')

  if (docId) {
    // Fetch single document with content (for viewing)
    const doc = await db.document.findUnique({ where: { id: docId }, include: { application: true } })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (user.role === 'APPLICANT' && doc.application.applicantId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // Return base64 - frontend can render or trigger download
    return NextResponse.json({
      document: {
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
        fileData: doc.fileData,
      },
    })
  }

  if (!appId) {
    return NextResponse.json({ error: 'appId or id required' }, { status: 400 })
  }

  const app = await db.application.findUnique({ where: { id: appId } })
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  if (user.role === 'APPLICANT' && app.applicantId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const docs = await db.document.findMany({
    where: { applicationId: appId },
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      documentType: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      uploadedAt: true,
    },
  })

  return NextResponse.json({ documents: docs })
}

// DELETE /api/documents?id=...
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const doc = await db.document.findUnique({ where: { id }, include: { application: true } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (user.role === 'APPLICANT' && doc.application.applicantId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (doc.application.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Cannot delete documents from a submitted application.' }, { status: 400 })
  }

  await db.document.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}