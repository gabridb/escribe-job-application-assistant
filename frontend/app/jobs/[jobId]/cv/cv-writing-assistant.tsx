'use client'

import { useCallback, useEffect, useState } from 'react'
import WritingAssistant from '@/app/components/writing-assistant'
import { tailoredCvService } from '@/lib/services/tailored-cv-service'
import { cvService } from '@/lib/services/cv-service'

interface CvWritingAssistantProps {
  jobId: string
}

export default function CvWritingAssistant({ jobId }: CvWritingAssistantProps) {
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined)
  const [baseCvText, setBaseCvText] = useState<string | undefined>(undefined)

  useEffect(() => {
    Promise.all([tailoredCvService.get(jobId), cvService.get()]).then(([tailoredCv, baseCv]) => {
      setInitialContent(tailoredCv?.text ?? baseCv?.text ?? '')
      setBaseCvText(baseCv?.text)
    })
  }, [jobId])

  const handleSave = useCallback(
    async (text: string) => {
      await tailoredCvService.upsert(jobId, text)
    },
    [jobId],
  )

  // Render nothing until we know the initial content to avoid a flash of empty editor
  if (initialContent === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-stone-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <WritingAssistant
      context="cv"
      jobId={jobId}
      title="Tailored CV"
      subtitle="Adapt your CV for this role"
      initialContent={initialContent}
      baseCvText={baseCvText}
      onSave={handleSave}
    />
  )
}
