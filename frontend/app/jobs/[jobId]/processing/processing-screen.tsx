'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJobs } from '@/app/context/jobs-context'

interface Props {
  jobId: string
}

export default function ProcessingScreen({ jobId }: Props) {
  const router = useRouter()
  const { jobs } = useJobs()
  const job = jobs.find((j) => j.id === jobId)

  // visibleStep: how many steps are currently shown (0–5)
  const [visibleStep, setVisibleStep] = useState(0)
  // doneStep: how many steps have the checkmark (vs spinner)
  const [doneStep, setDoneStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => { setVisibleStep(1); setDoneStep(1) }, 400),
      setTimeout(() => { setVisibleStep(2); setDoneStep(2) }, 900),
      setTimeout(() => { setVisibleStep(3); setDoneStep(3) }, 1400),
      setTimeout(() => { setVisibleStep(4) }, 1900),          // spinner for step 4
      setTimeout(() => { setDoneStep(4); setVisibleStep(5) }, 2800), // checkmark
      setTimeout(() => router.push('/'), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [router])

  const steps = [
    { label: 'Job description received' },
    { label: `Title: ${job?.title ?? '…'}` },
    { label: `Company: ${job?.company ?? '…'}` },
    { label: 'Generating interview themes…', doneLabel: '4 themes identified' },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-stone-900">Analysing your job offer</h1>
        <p className="mt-1 text-sm text-stone-500">powered by AI</p>

        <ul className="mt-6 space-y-3">
          {steps.map((step, i) => {
            const stepNumber = i + 1
            if (visibleStep < stepNumber) return null
            const isDone = doneStep >= stepNumber
            const label = isDone && step.doneLabel ? step.doneLabel : step.label

            return (
              <li key={i} className="flex items-center gap-3">
                {isDone ? (
                  <span className="text-emerald-500 text-base font-bold">✓</span>
                ) : (
                  <span className="text-cyan-500 text-base animate-spin inline-block">⟳</span>
                )}
                <span className={`text-sm ${isDone ? 'text-stone-900' : 'text-stone-600'}`}>
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
