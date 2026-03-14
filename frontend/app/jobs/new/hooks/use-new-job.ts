'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJobs } from '@/app/jobs-context'
import type { Job } from '@/lib/mock/jobs'

interface FormState {
  description: string
}

interface UseNewJobReturn {
  description: string
  setDescription: (value: string) => void
  isSubmitting: boolean
  handleSubmit: (e: React.FormEvent) => void
}

export function useNewJob(): UseNewJobReturn {
  const [form, setForm] = useState<FormState>({ description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addJob } = useJobs()
  const router = useRouter()

  const setDescription = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, description: value }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!form.description.trim()) return

      setIsSubmitting(true)

      // Extract a rough title and company from the first line of the pasted text.
      // In V1 this is a simple heuristic — no real AI parsing.
      const lines = form.description.trim().split('\n').filter(Boolean)
      const title = lines[0]?.slice(0, 80) ?? 'Untitled Role'
      const company = lines[1]?.slice(0, 60) ?? 'Unknown Company'

      const newJob: Job = {
        id: `job-${Date.now()}`,
        title,
        company,
        description: form.description,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }

      addJob(newJob)
      router.push('/')
    },
    [form, addJob, router],
  )

  return {
    description: form.description,
    setDescription,
    isSubmitting,
    handleSubmit,
  }
}
