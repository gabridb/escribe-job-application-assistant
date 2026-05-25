'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useJobs } from '@/app/context/jobs-context'
import { jobsService } from '@/lib/services/jobs-service'
import type { Job } from '@/lib/mock/jobs'
import type { Theme } from '@/lib/mock/themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface JobOverviewProps {
  jobId: string
}

export default function JobOverview({ jobId }: JobOverviewProps) {
  const { jobs } = useJobs()
  const jobFromContext = jobs.find((j) => j.id === jobId)
  const [fetchedJob, setFetchedJob] = useState<Job | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])

  const job = jobFromContext ?? fetchedJob

  useEffect(() => {
    if (!jobFromContext) {
      jobsService.getOne(jobId).then((j) => setFetchedJob(j))
    }
    fetch(`${API_URL}/api/jobs/${jobId}/themes`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Theme[]) => setThemes(data))
      .catch(() => setThemes([]))
  }, [jobId, jobFromContext])

  return (
    <main className="mx-auto max-w-3xl px-6 py-10" data-testid="job-overview">
      {job ? (
        <>
          <p className="text-sm text-stone-500">{job.company}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">{job.title}</h1>
        </>
      ) : (
        <p className="text-sm text-stone-400">Loading…</p>
      )}

      <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-medium text-stone-700">Interview themes</h2>
        {themes.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No themes yet for this role.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {themes.map((theme) => (
              <li
                key={theme.id}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700"
              >
                {theme.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 flex flex-col gap-3">
        <Link
          href={`/jobs/${jobId}/cover-letter`}
          data-testid="cta-cover-letter"
          style={{ backgroundColor: '#4a5c2f' }}
          className="inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Write Cover Letter
        </Link>
        <Link
          href={`/jobs/${jobId}/cv`}
          data-testid="cta-cv"
          className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors"
        >
          Tailor CV
        </Link>
        <Link
          href={`/jobs/${jobId}/themes`}
          data-testid="cta-themes"
          className="inline-flex items-center justify-center self-center px-2 py-1 text-sm text-stone-600 hover:text-stone-900 underline-offset-4 hover:underline"
        >
          Interview themes
        </Link>
      </section>
    </main>
  )
}
