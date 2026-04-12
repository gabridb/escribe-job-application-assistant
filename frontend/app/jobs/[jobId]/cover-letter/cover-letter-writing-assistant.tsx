'use client'

import { useCallback, useEffect, useState } from 'react'
import WritingAssistant from '@/app/components/writing-assistant'
import { coverLetterService } from '@/lib/services/cover-letter-service'
import { cvService } from '@/lib/services/cv-service'
import { jobsService } from '@/lib/services/jobs-service'
import { RelevantExperienceEntry } from '@/lib/services/chat-service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CoverLetterWritingAssistantProps {
  jobId: string
}

export default function CoverLetterWritingAssistant({ jobId }: CoverLetterWritingAssistantProps) {
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined)
  const [baseCvText, setBaseCvText] = useState<string | undefined>(undefined)
  const [jobDescription, setJobDescription] = useState<string | undefined>(undefined)
  const [relevantExperiences, setRelevantExperiences] = useState<RelevantExperienceEntry[]>([])

  useEffect(() => {
    async function load() {
      const [coverLetter, baseCv, job, themesRes] = await Promise.all([
        coverLetterService.get(jobId),
        cvService.get(),
        jobsService.getOne(jobId),
        fetch(`${API_URL}/api/jobs/${jobId}/themes`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ])

      setInitialContent(coverLetter?.text ?? '')
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
      await coverLetterService.upsert(jobId, text)
    },
    [jobId],
  )

  if (initialContent === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-stone-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <WritingAssistant
      context="cover-letter"
      jobId={jobId}
      title="Cover Letter"
      subtitle="Write your cover letter for this role"
      initialContent={initialContent}
      jobDescription={jobDescription}
      baseCvText={baseCvText}
      relevantExperiences={relevantExperiences}
      onSave={handleSave}
      autoWriteReplies={[{
        label: 'Write my cover letter',
        message: 'Please write a complete cover letter for me based on my CV, the job description, and my relevant experiences.',
      }]}
    />
  )
}
