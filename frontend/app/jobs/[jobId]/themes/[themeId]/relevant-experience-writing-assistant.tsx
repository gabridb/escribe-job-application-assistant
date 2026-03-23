'use client'

import { useCallback, useEffect, useState } from 'react'
import WritingAssistant from '@/app/components/writing-assistant'
import { relevantExperienceService } from '@/lib/services/relevant-experience-service'

interface RelevantExperienceWritingAssistantProps {
  jobId: string
  themeId: string
}

export default function RelevantExperienceWritingAssistant({
  jobId,
  themeId,
}: RelevantExperienceWritingAssistantProps) {
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined)
  const [initialGreeting, setInitialGreeting] = useState<string | undefined>(undefined)

  useEffect(() => {
    relevantExperienceService.get(jobId, themeId)
      .then((experience) => {
        setInitialContent(experience.text)
        setInitialGreeting(experience.initialGreeting)
      })
      .catch(() => {
        setInitialContent('')
        setInitialGreeting('Hello! How can I help you with your relevant experience?')
      })
  }, [jobId, themeId])

  const handleSave = useCallback(
    async (text: string) => {
      await relevantExperienceService.upsert(jobId, themeId, text)
    },
    [jobId, themeId],
  )

  if (initialContent === undefined || initialGreeting === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-stone-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <WritingAssistant
      context="relevant-experience"
      jobId={jobId}
      themeId={themeId}
      title="Relevant Experience"
      subtitle="Write your example for this theme"
      initialContent={initialContent}
      initialGreeting={initialGreeting}
      onSave={handleSave}
      suggestedReplies={[{ label: 'Review my draft', message: 'Please review my draft' }]}
    />
  )
}
