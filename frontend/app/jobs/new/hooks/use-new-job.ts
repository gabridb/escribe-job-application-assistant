'use client'

import { useCallback, useState } from 'react'
import { useJobs } from '@/app/context/jobs-context'
import { useThemes } from '@/app/context/themes-context'
import { generateMockThemes } from '@/lib/mock/themes'
import type { Job } from '@/lib/mock/jobs'

interface UseNewJobReturn {
  description: string
  setDescription: (value: string) => void
  isSubmitting: boolean
  handleSubmit: (e: React.FormEvent) => void
}

export function useNewJob(onSuccess?: () => void): UseNewJobReturn {
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addJob } = useJobs()
  const { addThemes } = useThemes()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!description.trim()) return

      setIsSubmitting(true)

      // Extract a rough title and company from the first line of the pasted text.
      // In V1 this is a simple heuristic — no real AI parsing.
      const lines = description.trim().split('\n').filter(Boolean)
      const title = lines[0]?.slice(0, 80) ?? 'Untitled Role'
      const company = lines[1]?.slice(0, 60) ?? 'Unknown Company'

      const newJob: Job = {
        id: `job-${Date.now()}`,
        title,
        company,
        description,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }

      addJob(newJob)
      addThemes(generateMockThemes(newJob))
      onSuccess?.()
    },
    [description, addJob, addThemes, onSuccess],
  )

  return { description, setDescription, isSubmitting, handleSubmit }
}
