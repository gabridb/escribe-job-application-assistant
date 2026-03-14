'use client'

import { useCallback, useState } from 'react'
import { useJobs } from '@/app/context/jobs-context'
import { useThemes } from '@/app/context/themes-context'
import { generateMockThemes } from '@/lib/mock/themes'
import type { Job } from '@/lib/mock/jobs'

interface UseNewJobReturn {
  description: string
  setDescription: (value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  submitWithText: (text: string) => void
}

export function useNewJob(onSuccess?: (jobId: string) => void): UseNewJobReturn {
  const [description, setDescription] = useState('')
  const { addJob } = useJobs()
  const { addThemes } = useThemes()

  const submitWithText = useCallback(
    (text: string) => {
      if (!text.trim()) return

      const lines = text.trim().split('\n').filter(Boolean)
      const title = lines[0]?.slice(0, 80) ?? 'Untitled Role'
      const company = lines[1]?.slice(0, 60) ?? 'Unknown Company'

      const newJob: Job = {
        id: `job-${Date.now()}`,
        title,
        company,
        description: text,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }

      addJob(newJob)
      addThemes(generateMockThemes(newJob))
      onSuccess?.(newJob.id)
    },
    [addJob, addThemes, onSuccess],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      submitWithText(description)
    },
    [description, submitWithText],
  )

  return { description, setDescription, handleSubmit, submitWithText }
}
