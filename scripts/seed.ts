// Seed the database with default reviewer and admin accounts for the Harari Region PCC portal.
// Run with: `bun run scripts/seed.ts`
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding Harari PCC database...')

  // Default Admin
  const adminPass = await bcrypt.hash('Admin@2026', 10)
  const admin = await db.user.upsert({
    where: { email: 'admin@hararipcc.gov.et' },
    update: {},
    create: {
      email: 'admin@hararipcc.gov.et',
      passwordHash: adminPass,
      fullName: 'Harari PCC Administrator',
      role: 'ADMIN',
      phoneNumber: '+251912345678',
      nationalId: 'HARARI-ADMIN-001',
      region: 'Harari',
      city: 'Harar',
      officeName: 'Harari Region Trade, Industry & Tourism Development Bureau',
      jobTitle: 'System Administrator',
    },
  })

  // Default Reviewer
  const reviewerPass = await bcrypt.hash('Reviewer@2026', 10)
  const reviewer = await db.user.upsert({
    where: { email: 'reviewer@hararipcc.gov.et' },
    update: {},
    create: {
      email: 'reviewer@hararipcc.gov.et',
      passwordHash: reviewerPass,
      fullName: 'Amina Abdurahman',
      role: 'REVIEWER',
      phoneNumber: '+251923456789',
      nationalId: 'HARARI-REV-001',
      region: 'Harari',
      city: 'Harar',
      officeName: 'Harari Region Trade, Industry & Tourism Development Bureau',
      jobTitle: 'Senior Licensing Officer',
    },
  })

  // Sample applicant
  const applicantPass = await bcrypt.hash('Applicant@2026', 10)
  const applicant = await db.user.upsert({
    where: { email: 'applicant@example.com' },
    update: {},
    create: {
      email: 'applicant@example.com',
      passwordHash: applicantPass,
      fullName: 'Yusuf Ibrahim',
      role: 'APPLICANT',
      phoneNumber: '+251934567890',
      nationalId: 'HR-APPLICANT-001',
      region: 'Harari',
      city: 'Harar',
      woreda: 'Jugol',
      kebele: '04',
    },
  })

  console.log('Seed complete:')
  console.log('  Admin:    admin@hararipcc.gov.et  /  Admin@2026')
  console.log('  Reviewer: reviewer@hararipcc.gov.et  /  Reviewer@2026')
  console.log('  Applicant: applicant@example.com  /  Applicant@2026')
  console.log('  IDs:', { admin: admin.id, reviewer: reviewer.id, applicant: applicant.id })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await db.$disconnect()
})
