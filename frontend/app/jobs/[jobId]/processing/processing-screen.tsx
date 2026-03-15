'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJobs } from '@/app/context/jobs-context'
import { useThemes } from '@/app/context/themes-context'
import type { ThemeStatus } from '@/lib/mock/themes'

interface Props {
  jobId: string
}

export default function ProcessingScreen({ jobId }: Props) {
  const router = useRouter()
  const { jobs, updateJob } = useJobs()
  const { addThemes } = useThemes()
  const job = jobs.find((j) => j.id === jobId)

  const [visibleStep, setVisibleStep] = useState(0)
  const [doneStep, setDoneStep] = useState(0)
  const [resolvedTitle, setResolvedTitle] = useState<string | null>(null)
  const [resolvedCompany, setResolvedCompany] = useState<string | null>(null)
  const [themeCount, setThemeCount] = useState<number | null>(null)

  const called = useRef(false)

  useEffect(() => {
    if (!job || called.current) return
    called.current = true

    setVisibleStep(1)
    setDoneStep(1)

    fetch('/api/analyze-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: job.description }),
    })
      .then((r) => r.json())
      .then((data: { title: string; company: string; themes: { name: string; description: string }[] }) => {
        const { title, company, themes } = data

        setResolvedTitle(title)
        setVisibleStep(2)
        setDoneStep(2)

        setResolvedCompany(company)
        setVisibleStep(3)
        setDoneStep(3)

        setThemeCount(themes.length)
        setVisibleStep(4)

        updateJob(jobId, { title, company })
        addThemes(
          themes.map((t, i) => ({
            id: `${jobId}-theme-${i + 1}`,
            jobId,
            name: t.name,
            description: t.description,
            status: 'todo' as ThemeStatus,
          })),
        )

        setDoneStep(4)
        setTimeout(() => router.push('/'), 600)
      })
      .catch((err) => {
        console.error('analyze-job failed:', err)
        router.push('/')
      })
  }, [job, jobId, updateJob, addThemes, router])

  const steps = [
    { label: 'Job description received' },
    { label: `Title: ${resolvedTitle ?? '…'}` },
    { label: `Company: ${resolvedCompany ?? '…'}` },
    { label: 'Generating interview themes…', doneLabel: themeCount !== null ? `${themeCount} themes identified` : 'Themes identified' },
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
