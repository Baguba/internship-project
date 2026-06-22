'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Loader2, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, XCircle,
  Trophy, RotateCcw, AlertCircle
} from 'lucide-react'
import { HarariStar, HarariBorder } from '@/components/harari/Decorations'

interface Question {
  id: string
  category: string
  question: string
  options: string[]
}

interface AssessmentRunnerProps {
  application: { id: string; assessmentScore: number; assessmentTotal: number; assessmentPassed: boolean }
  onPassed: (score: number, total: number) => void
  onBack: () => void
}

type Stage = 'intro' | 'taking' | 'result'

export function AssessmentRunner({ application, onPassed, onBack }: AssessmentRunnerProps) {
  const [stage, setStage] = useState<Stage>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; results: { question: string; options: string[]; selectedIndex: number; correctIndex: number; correct: boolean; explanation: string }[] } | null>(null)

  // If already passed, show intro with option to retake
  useEffect(() => {
    if (application.assessmentPassed) {
      setStage('result')
      setResult({
        score: application.assessmentScore,
        total: application.assessmentTotal,
        passed: true,
        results: [],
      })
    }
  }, [application])

  async function startAssessment() {
    setLoading(true)
    try {
      const res = await fetch('/api/assessment', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to load assessment')
        return
      }
      setQuestions(data.questions)
      setAnswers({})
      setCurrent(0)
      setResult(null)
      setStage('taking')
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function submitAssessment() {
    setLoading(true)
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
      }
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Submission failed')
        return
      }
      setResult(data)
      setStage('result')
      if (data.passed) {
        toast.success(`Passed! ${data.score}/${data.total}`)
        onPassed(data.score, data.total)
      } else {
        toast.error(`Did not pass. ${data.score}/${data.total}. You can retry.`)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length

  /* ---------- Intro ---------- */
  if (stage === 'intro') {
    return (
      <Card className="border-[#D4A537]/30 fade-in-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><HarariStar size={48} /></div>
          <CardTitle className="flex items-center justify-center gap-2 text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
            <BookOpen className="h-5 w-5 text-[#5B2A86]" /> Professional Competence Assessment
          </CardTitle>
          <HarariBorder />
          <CardDescription className="max-w-xl mx-auto mt-2">
            You are about to take a 10-question assessment covering Ethiopian business
            registration, taxation, labour law, consumer protection, and Harari regional
            regulations. You need to score at least 70% to pass.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl mx-auto">
          <div className="grid grid-cols-3 gap-3">
            <InfoBox label="Questions" value="10" />
            <InfoBox label="Pass Mark" value="70%" />
            <InfoBox label="Categories" value="9" />
          </div>
          <div className="rounded-lg bg-[#D4A537]/10 border border-[#D4A537]/40 p-4 text-sm text-[#1E3A5F]">
            <p className="font-semibold mb-1">Important notes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The assessment is randomly generated from a bank of 17 questions.</li>
              <li>You can review your answers before submitting.</li>
              <li>If you don't pass, you can retry as many times as needed.</li>
              <li>Your best score will be saved to your application.</li>
            </ul>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
            <Button onClick={startAssessment} disabled={loading} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ---------- Taking ---------- */
  if (stage === 'taking') {
    const q = questions[current]
    const total = questions.length
    const progress = ((current + 1) / total) * 100
    return (
      <Card className="border-[#D4A537]/30 fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#1E3A5F]">
              Question {current + 1} of {total}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {answeredCount} of {total} answered
            </span>
          </div>
          <Progress value={progress} className="h-1.5 mt-2" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#5B2A86]/10 px-3 py-1 text-xs text-[#5B2A86]">
            <span className="font-semibold">{q.category}</span>
          </div>
          <p className="text-lg font-semibold text-[#1E3A5F] leading-relaxed">{q.question}</p>

          <RadioGroup
            value={answers[q.id] !== undefined ? String(answers[q.id]) : ''}
            onValueChange={(v) => setAnswers({ ...answers, [q.id]: Number(v) })}
            className="space-y-2"
          >
            {q.options.map((opt, i) => (
              <div key={i}>
                <Label
                  htmlFor={`opt-${q.id}-${i}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    answers[q.id] === i
                      ? 'border-[#5B2A86] bg-[#5B2A86]/5'
                      : 'border-[#D4A537]/20 hover:border-[#D4A537]/60 hover:bg-[#FFFBF0]/40'
                  }`}
                >
                  <RadioGroupItem value={String(i)} id={`opt-${q.id}-${i}`} className="mt-1" />
                  <span className="text-sm">{opt}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            {current < total - 1 ? (
              <Button onClick={() => setCurrent(current + 1)} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={submitAssessment} disabled={!allAnswered || loading} className="bg-[#2E7A5A] hover:bg-[#236347]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Submit Assessment
              </Button>
            )}
          </div>
          {!allAnswered && current === total - 1 && (
            <p className="text-xs text-destructive text-center">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Please answer all questions before submitting.
            </p>
          )}

          {/* Question dots */}
          <div className="flex justify-center gap-1.5 pt-3">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setCurrent(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  answers[qq.id] !== undefined
                    ? 'bg-[#2E7A5A]'
                    : i === current
                    ? 'bg-[#5B2A86]'
                    : 'bg-muted-foreground/30'
                }`}
                aria-label={`Question ${i + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ---------- Result ---------- */
  if (stage === 'result' && result) {
    const percent = Math.round((result.score / Math.max(result.total, 1)) * 100)
    return (
      <Card className="border-[#D4A537]/30 fade-in-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {result.passed ? (
              <div className="h-16 w-16 rounded-full bg-[#2E7A5A]/15 flex items-center justify-center">
                <Trophy className="h-9 w-9 text-[#D4A537]" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#B5471A]/15 flex items-center justify-center">
                <XCircle className="h-9 w-9 text-[#B5471A]" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-[#1E3A5F]" style={{ fontFamily: 'var(--font-display)' }}>
            {result.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
          </CardTitle>
          <HarariBorder />
        </CardHeader>
        <CardContent className="space-y-5 max-w-xl mx-auto">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#5B2A86]" style={{ fontFamily: 'var(--font-display)' }}>
              {result.score}<span className="text-2xl text-muted-foreground">/{result.total}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{percent}% · Pass mark: 70%</p>
          </div>

          {result.passed ? (
            <div className="rounded-lg bg-[#2E7A5A]/10 border border-[#2E7A5A]/40 p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-[#2E7A5A] mx-auto mb-1" />
              <p className="text-sm text-[#2E7A5A] font-medium">
                Congratulations! Your assessment score has been saved. You can now proceed to submit your application.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-[#B5471A]/10 border border-[#B5471A]/40 p-4 text-center">
              <AlertCircle className="h-5 w-5 text-[#B5471A] mx-auto mb-1" />
              <p className="text-sm text-[#B5471A] font-medium">
                You did not pass this time. Review the explanations below and try again — there's no limit on attempts.
              </p>
            </div>
          )}

          {/* Review answers */}
          {result.results.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-[#1E3A5F]">Review Your Answers</h4>
              {result.results.map((r, i) => (
                <div key={i} className={`border rounded-lg p-3 ${r.correct ? 'border-[#2E7A5A]/40 bg-[#2E7A5A]/5' : 'border-[#B5471A]/40 bg-[#B5471A]/5'}`}>
                  <div className="flex items-start gap-2 mb-1">
                    {r.correct ? <CheckCircle2 className="h-4 w-4 text-[#2E7A5A] mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-[#B5471A] mt-0.5 shrink-0" />}
                    <p className="text-sm font-medium text-[#1E3A5F]">{r.question}</p>
                  </div>
                  {!r.correct && (
                    <p className="text-xs text-[#B5471A] ml-6 mb-1">
                      Your answer: {r.options[r.selectedIndex]}
                    </p>
                  )}
                  <p className="text-xs text-[#2E7A5A] ml-6 mb-1">
                    Correct: {r.options[r.correctIndex]}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">{r.explanation}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Documents</Button>
            {result.passed ? (
              <Button onClick={() => onPassed(result.score, result.total)} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
                Continue to Review <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={startAssessment} disabled={loading} className="bg-[#5B2A86] hover:bg-[#4A1F6E]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                Retry Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 rounded-lg border border-[#D4A537]/30 bg-[#FFFBF0]/40">
      <p className="text-xl font-bold text-[#5B2A86]" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
