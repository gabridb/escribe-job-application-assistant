'use client'

import { useCallback, useEffect, useState } from 'react'
import WritingAssistant from '@/app/components/writing-assistant'
import { coverLetterService } from '@/lib/services/cover-letter-service'
import { cvService } from '@/lib/services/cv-service'
import { jobsService } from '@/lib/services/jobs-service'
import { relevantExperienceService } from '@/lib/services/relevant-experience-service'
import { RelevantExperienceEntry, ThemeCoverage } from '@/lib/services/chat-service'
import { buildCoverLetterGreeting } from './cover-letter-greeting'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CoverLetterWritingAssistantProps {
  jobId: string
}

interface ThemeWithCoverage extends ThemeCoverage {
  id: string
}

export default function CoverLetterWritingAssistant({ jobId }: CoverLetterWritingAssistantProps) {
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined)
  const [initialGreeting, setInitialGreeting] = useState<string | undefined>(undefined)
  const [baseCvText, setBaseCvText] = useState<string | undefined>(undefined)
  const [jobDescription, setJobDescription] = useState<string | undefined>(undefined)
  const [relevantExperiences, setRelevantExperiences] = useState<RelevantExperienceEntry[]>([])
  const [themes, setThemes] = useState<ThemeWithCoverage[]>([])

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

      const experiences: RelevantExperienceEntry[] = []
      const coverage: ThemeWithCoverage[] = []

      const rawThemes: Array<{ id: string; name: string; description?: string }> = themesRes ?? []
      if (rawThemes.length > 0) {
        const experienceResults = await Promise.all(
          rawThemes.map((theme) =>
            fetch(`${API_URL}/api/jobs/${jobId}/themes/${theme.id}/experience`, {
              cache: 'no-store',
            })
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
              .then((data) => ({
                theme,
                experienceText: data?.text ? (data.text as string) : null,
              })),
          ),
        )

        for (const { theme, experienceText } of experienceResults) {
          const hasExperience = experienceText !== null && experienceText.trim().length > 0
          coverage.push({
            id: theme.id,
            name: theme.name,
            description: theme.description,
            hasExperience,
          })
          if (hasExperience) {
            experiences.push({ themeName: theme.name, text: experienceText! })
          }
        }
        setRelevantExperiences(experiences)
        setThemes(coverage)
      }

      setInitialGreeting(
        buildCoverLetterGreeting({
          title: job?.title,
          company: job?.company,
          hasBaseCv: Boolean(baseCv?.text && baseCv.text.trim().length > 0),
          experienceThemeNames: experiences.map((e) => e.themeName),
        }),
      )
    }

    load()
  }, [jobId])

  const handleSave = useCallback(
    async (text: string) => {
      await coverLetterService.upsert(jobId, text)
    },
    [jobId],
  )

  const handleSaveExperienceCandidate = useCallback(
    async (themeName: string, text: string): Promise<boolean> => {
      const theme = themes.find((t) => t.name === themeName)
      if (!theme) return false
      try {
        await relevantExperienceService.upsert(jobId, theme.id, text)
        setThemes((prev) =>
          prev.map((t) => (t.id === theme.id ? { ...t, hasExperience: true } : t)),
        )
        setRelevantExperiences((prev) => [
          ...prev.filter((e) => e.themeName !== themeName),
          { themeName, text },
        ])
        return true
      } catch {
        return false
      }
    },
    [jobId, themes],
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
      context="cover-letter"
      jobId={jobId}
      title="Cover Letter"
      subtitle="Write your cover letter for this role"
      initialContent={initialContent}
      initialGreeting={initialGreeting}
      jobDescription={jobDescription}
      baseCvText={baseCvText}
      relevantExperiences={relevantExperiences}
      themes={themes}
      onSave={handleSave}
      onSaveExperienceCandidate={handleSaveExperienceCandidate}
      autoWriteReplies={[{
        label: 'Write my cover letter',
        message: 'Please write a complete cover letter for me based on my CV, the job description, and my relevant experiences.',
      }]}
    />
  )
}
