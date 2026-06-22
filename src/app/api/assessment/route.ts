import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ASSESSMENT_QUESTIONS, pickQuestions, PASS_THRESHOLD, type AssessmentQuestion } from '@/lib/assessment'

// GET: return random set of questions for a fresh assessment
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') || '10', 10)
  const questions = pickQuestions(count)
  // Strip correctIndex + explanation from response
  const safe = questions.map((q: AssessmentQuestion) => ({
    id: q.id,
    category: q.category,
    question: q.question,
    options: q.options,
  }))
  return NextResponse.json({
    questions: safe,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    passThreshold: PASS_THRESHOLD,
    count: safe.length,
  })
}

// POST: submit answers and get graded
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // answers: { questionId, selectedIndex }[]
  const answers: { questionId: string; selectedIndex: number }[] = body.answers || []
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: 'No answers submitted.' }, { status: 400 })
  }

  let correct = 0
  const results: { questionId: string; selectedIndex: number; correctIndex: number; correct: boolean; explanation: string; question: string; options: string[] }[] = []
  for (const ans of answers) {
    const q = ASSESSMENT_QUESTIONS.find(x => x.id === ans.questionId)
    if (!q) continue
    const isCorrect = ans.selectedIndex === q.correctIndex
    if (isCorrect) correct += 1
    results.push({
      questionId: q.id,
      selectedIndex: ans.selectedIndex,
      correctIndex: q.correctIndex,
      correct: isCorrect,
      explanation: q.explanation,
      question: q.question,
      options: q.options,
    })
  }

  const total = answers.length
  const score = correct
  const passed = (score / total) >= PASS_THRESHOLD

  return NextResponse.json({
    score,
    total,
    passed,
    passThreshold: PASS_THRESHOLD,
    results,
  })
}
