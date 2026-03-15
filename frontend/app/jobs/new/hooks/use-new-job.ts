'use client'

import { useCallback, useState } from 'react'
import { useJobs } from '@/app/context/jobs-context'
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

  const submitWithText = useCallback(
    (text: string) => {
      if (!text.trim()) return

      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: 'Analysing…',
        company: 'Analysing…',
        description: text,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }

      addJob(newJob)
      onSuccess?.(newJob.id)
    },
    [addJob, onSuccess],
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
