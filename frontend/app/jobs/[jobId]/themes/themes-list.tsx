'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useThemes } from '@/app/context/themes-context'
import { useJobs } from '@/app/context/jobs-context'
import type { Theme } from '@/lib/mock/themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const statusLabel: Record<string, string> = {
  done: 'Done',
  'in-progress': 'In Progress',
  todo: 'To Do',
}
const statusClass: Record<string, string> = {
  done: 'bg-emerald-100 text-emerald-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  todo: 'bg-stone-100 text-stone-500',
}

export default function ThemesList({ jobId }: { jobId: string }) {
  const { themes, loadThemes } = useThemes()
  const { jobs } = useJobs()
  const job = jobs.find(j => j.id === jobId)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch(`${API_URL}/api/jobs/${jobId}/themes`)
      .then((res) => (res.ok ? res.json() : []))
      .then((fetched: Theme[]) => {
        loadThemes(fetched)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [jobId, loadThemes])

  const jobThemes = themes.filter(t => t.jobId === jobId)

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Key Interview Themes</h1>
      {job && (
        <p className="text-stone-500 mt-1">{job.title} @ {job.company}</p>
      )}
      <div className="mt-8 bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
        {isLoading ? (
          <p className="p-6 text-stone-400 text-sm">Loading themes…</p>
        ) : jobThemes.length === 0 ? (
          <p className="p-6 text-stone-400 text-sm">No themes yet.</p>
        ) : (
          jobThemes.map(theme => (
            <Link
              key={theme.id}
              href={`/jobs/${jobId}/themes/${theme.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-stone-900">{theme.name}</span>
                  <Badge className={statusClass[theme.status]}>{statusLabel[theme.status]}</Badge>
                </div>
                <p className="text-sm text-stone-500 truncate">{theme.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
