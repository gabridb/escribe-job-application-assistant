'use client'

import { useCallback, useEffect, useState } from 'react'
import WritingAssistant from '@/app/components/writing-assistant'
import { tailoredCvService } from '@/lib/services/tailored-cv-service'
import { cvService } from '@/lib/services/cv-service'
import { jobsService } from '@/lib/services/jobs-service'
import { RelevantExperienceEntry } from '@/lib/services/chat-service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CvWritingAssistantProps {
  jobId: string
}

export default function CvWritingAssistant({ jobId }: CvWritingAssistantProps) {
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined)
  const [baseCvText, setBaseCvText] = useState<string | undefined>(undefined)
  const [jobDescription, setJobDescription] = useState<string | undefined>(undefined)
  const [relevantExperiences, setRelevantExperiences] = useState<RelevantExperienceEntry[]>([])

  useEffect(() => {
    async function load() {
      const [tailoredCv, baseCv, job, themesRes] = await Promise.all([
        tailoredCvService.get(jobId),
        cvService.get(),
        jobsService.getOne(jobId),
        fetch(`${API_URL}/api/jobs/${jobId}/themes`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ])

      setInitialContent(tailoredCv?.text ?? baseCv?.text ?? '')
      setBaseCvText(baseCv?.text)
      setJobDescription(job?.description)

      const themes: Array<{ id: string; name: string }> = themesRes ?? []
      if (themes.length > 0) {
        const experienceResults = await Promise.all(
          themes.map((theme) =>
            fetch(`${API_URL}/api/jobs/${jobId}/themes/${theme.id}/experience`, {
              cache: 'no-store',
            })
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
              .then((data) =>
                data?.text ? { themeName: theme.name, text: data.text as string } : null,
              ),
          ),
        )
        setRelevantExperiences(
          experienceResults.filter((e): e is RelevantExperienceEntry => e !== null),
        )
      }
    }

    load()
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
      jobDescription={jobDescription}
      relevantExperiences={relevantExperiences}
      onSave={handleSave}
      autoWriteReplies={[{
        label: 'Tailor my CV for this role',
        message: 'Please tailor my CV for this specific role, highlighting the most relevant experience and skills.',
      }]}
    />
  )
}
