// Professional Competence Assessment Question Bank
// Tailored for Harari Region, Ethiopia - business competence test

export interface AssessmentQuestion {
  id: string
  category: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Tax & Registration
  {
    id: 'q1',
    category: 'Business Registration',
    question: 'In Ethiopia, which government body is primarily responsible for issuing a commercial registration certificate (TIN) for a new business?',
    options: [
      'The Federal Inland Revenue Authority (FIRA) / ERCA',
      'The local kebele office only',
      'The Ministry of Education',
      'The National Bank of Ethiopia',
    ],
    correctIndex: 0,
    explanation: 'The Ethiopian Revenue and Customs Authority (ERCA) / Federal Inland Revenue Authority issues Taxpayer Identification Numbers (TIN) required for any registered business.',
  },
  {
    id: 'q2',
    category: 'Business Registration',
    question: 'What does "TIN" stand for in the Ethiopian business context?',
    options: [
      'Trade Identification Number',
      'Taxpayer Identification Number',
      'Territory Issue Note',
      'Trade and Investment Notification',
    ],
    correctIndex: 1,
    explanation: 'TIN stands for Taxpayer Identification Number — a 10-digit unique identifier issued by ERCA used for all tax-related transactions.',
  },
  {
    id: 'q3',
    category: 'Taxation',
    question: 'In Ethiopia, Value Added Tax (VAT) registration is mandatory for businesses with annual taxable turnover exceeding:',
    options: [
      'ETB 100,000',
      'ETB 500,000',
      'ETB 1,000,000',
      'ETB 5,000,000',
    ],
    correctIndex: 1,
    explanation: 'Under Ethiopian law, businesses with annual taxable turnover exceeding ETB 500,000 are required to register for VAT.',
  },
  // Regional
  {
    id: 'q4',
    category: 'Harari Region',
    question: 'The Harari People Regional State has its capital at which historic walled city, a UNESCO World Heritage Site?',
    options: [
      'Dire Dawa',
      'Harar Jugol',
      'Jijiga',
      'Babile',
    ],
    correctIndex: 1,
    explanation: 'Harar Jugol — the historic walled city of Harar — is the capital of the Harari People Regional State and a UNESCO World Heritage Site since 2006.',
  },
  {
    id: 'q5',
    category: 'Harari Region',
    question: 'Which regional bureau issues the Professional Competence Certificate (PCC) that authorizes you to operate a business in the Harari Region?',
    options: [
      'The Harari Region Trade, Industry & Tourism Development Bureau',
      'The Harari Region Health Bureau',
      'The Harari Region Education Bureau',
      'The Harari Region Agriculture Bureau',
    ],
    correctIndex: 0,
    explanation: 'The Harari Region Trade, Industry & Tourism Development Bureau is responsible for issuing the PCC and business licensing within the region.',
  },
  // Consumer protection
  {
    id: 'q6',
    category: 'Consumer Protection',
    question: 'Under Ethiopian consumer protection law, businesses must ensure that goods sold to consumers are:',
    options: [
      'Of acceptable quality, safe, and as described',
      'Sold at the cheapest price in the market',
      'Imported from outside Ethiopia',
      'Refundable for any reason within 90 days',
    ],
    correctIndex: 0,
    explanation: 'The Ethiopian Trade Competition and Consumer Protection Proclamation requires that goods be of acceptable quality, fit for purpose, safe, and match their description.',
  },
  {
    id: 'q7',
    category: 'Consumer Protection',
    question: 'A customer in Harar wants to return a defective product they bought yesterday. Under consumer protection law, the business should:',
    options: [
      'Refuse — all sales are final',
      'Offer repair, replacement, or refund as appropriate',
      'Tell them to contact the manufacturer only',
      'Charge a 50% restocking fee',
    ],
    correctIndex: 1,
    explanation: 'The business is obligated to repair, replace, or refund defective products. Consumer protection laws in Ethiopia prohibit "no refund" policies on defective goods.',
  },
  // Labour
  {
    id: 'q8',
    category: 'Labour Law',
    question: 'According to the Ethiopian Labour Proclamation, the standard maximum regular working week is:',
    options: [
      '40 hours',
      '45 hours',
      '48 hours',
      '55 hours',
    ],
    correctIndex: 2,
    explanation: 'The Ethiopian Labour Proclamation sets the standard maximum regular working week at 48 hours. Overtime must be compensated at premium rates.',
  },
  {
    id: 'q9',
    category: 'Labour Law',
    question: 'In Ethiopia, an employee is generally entitled to how many days of paid annual leave per year after one year of service?',
    options: [
      '7 days',
      '14 days',
      '16 to 30 days depending on length of service',
      '60 days',
    ],
    correctIndex: 2,
    explanation: 'The Ethiopian Labour Proclamation provides graduated annual leave: 16 days for the first year, increasing with length of service up to 30 days.',
  },
  // Health & Hygiene (very important for food businesses)
  {
    id: 'q10',
    category: 'Health & Hygiene',
    question: 'Before opening a food handling business in Harari, which additional certification is required from the Health Bureau?',
    options: [
      'A Sanitary Permit / Health Certificate',
      'A Driving Licence',
      'A Customs Clearance Certificate',
      'A Building Permit only',
    ],
    correctIndex: 0,
    explanation: 'Food handling businesses must obtain a Sanitary Permit and employees must hold valid Health Certificates issued by the regional Health Bureau before operation.',
  },
  {
    id: 'q11',
    category: 'Health & Hygiene',
    question: 'Which of the following is the most important hygiene practice for staff handling food?',
    options: [
      'Wearing perfume',
      'Regular hand washing and use of clean protective clothing',
      'Serving food at room temperature for hours',
      'Storing raw meat above cooked food',
    ],
    correctIndex: 1,
    explanation: 'Regular hand washing, clean aprons, hair restraints, and proper food storage are mandatory hygiene practices that prevent food-borne illness.',
  },
  // Accounting basics
  {
    id: 'q12',
    category: 'Accounting & Record-Keeping',
    question: 'For how long must a registered business in Ethiopia retain its financial books and supporting documents?',
    options: [
      '1 year',
      '3 years',
      'At least 5 years (some taxes up to 10 years)',
      'No retention requirement',
    ],
    correctIndex: 2,
    explanation: 'Ethiopian tax law requires businesses to retain books of accounts and supporting documents for at least 5 years, and in some cases up to 10 years, for audit purposes.',
  },
  {
    id: 'q13',
    category: 'Accounting & Record-Keeping',
    question: 'Which of the following is the most fundamental record a small business must keep daily?',
    options: [
      'Social media posts',
      'A cash book / sales and purchase journal',
      'Employee vacation schedules',
      'Customer birthday list',
    ],
    correctIndex: 1,
    explanation: 'A cash book recording all sales and purchases is the foundation of business accounting and is required for tax filing and audit compliance.',
  },
  // Ethics
  {
    id: 'q14',
    category: 'Business Ethics',
    question: 'A supplier offers you a "special discount" that bypasses the tax invoice. The correct action is to:',
    options: [
      'Accept — discounts are good for profit',
      'Refuse and insist on a proper tax invoice',
      'Accept but report the supplier later',
      'Accept and not record the transaction',
    ],
    correctIndex: 1,
    explanation: 'Transactions without proper tax invoices constitute tax evasion. You must refuse and insist on a proper invoice to remain legally compliant.',
  },
  {
    id: 'q15',
    category: 'Business Ethics',
    question: 'Which of the following best describes a fair pricing practice in a competitive market?',
    options: [
      'Agreeing with competitors to fix prices',
      'Charging whatever the market can bear regardless of cost',
      'Setting prices based on costs, reasonable margin, and competition',
      'Selling below cost permanently to drive rivals out',
    ],
    correctIndex: 2,
    explanation: 'Fair pricing considers production costs, a reasonable profit margin, and market competition. Price-fixing and predatory pricing are prohibited by competition law.',
  },
  // Banking & Finance
  {
    id: 'q16',
    category: 'Banking & Finance',
    question: 'When opening a business bank account in Ethiopia, which document is typically NOT required?',
    options: [
      'TIN certificate',
      'Business licence',
      'Memorandum of Association (for companies)',
      'A personal wedding certificate',
    ],
    correctIndex: 3,
    explanation: 'Banks require TIN, business licence, registration documents, and IDs. A personal marriage certificate is irrelevant to business account opening.',
  },
  {
    id: 'q17',
    category: 'Banking & Finance',
    question: 'What is the primary purpose of separating personal and business bank accounts?',
    options: [
      'To earn more interest',
      'To maintain clear financial records and simplify tax reporting',
      'To avoid paying any tax',
      'To qualify for more loans',
    ],
    correctIndex: 1,
    explanation: 'Separating personal and business finances ensures accurate bookkeeping, simplifies tax reporting, and is often a legal requirement for registered businesses.',
  },
]

// Randomly sample N questions for an assessment
export function pickQuestions(count: number = 10): AssessmentQuestion[] {
  const shuffled = [...ASSESSMENT_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, ASSESSMENT_QUESTIONS.length))
}

export const PASS_THRESHOLD = 0.7 // 70% to pass
