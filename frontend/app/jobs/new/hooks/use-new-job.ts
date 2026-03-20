'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJobs } from '@/app/context/jobs-context'
import { useThemes } from '@/app/context/themes-context'
import { jobsService } from '@/lib/services/jobs-service'

interface UseNewJobReturn {
  description: string
  setDescription: (value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

export function useNewJob(onSuccess?: (jobId: string) => void): UseNewJobReturn {
  const router = useRouter()
  const { addJob } = useJobs()
  const { addThemes } = useThemes()
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submitWithText = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return
      setIsLoading(true)
      try {
        const result = await jobsService.create(text.trim())
        addJob(result)
        addThemes(result.themes)
        if (onSuccess) {
          onSuccess(result.id)
        } else {
          router.push(`/jobs/${result.id}/themes`)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [addJob, addThemes, isLoading, onSuccess, router],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      submitWithText(description)
    },
    [description, submitWithText],
  )

  return { description, setDescription, handleSubmit, isLoading }
}
