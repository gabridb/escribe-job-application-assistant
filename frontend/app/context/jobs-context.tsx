'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Job } from '@/lib/mock/jobs'
import { jobsService } from '@/lib/services/jobs-service'

interface JobsContextValue {
  jobs: Job[]
  addJob: (job: Job) => void
  updateJob: (id: string, patch: Partial<Job>) => void
  deleteJob: (id: string) => void
}

const JobsContext = createContext<JobsContextValue | null>(null)

export function JobsProvider({
  initialJobs,
  children,
}: {
  initialJobs: Job[]
  children: React.ReactNode
}) {
  // Always start with server-provided data to match SSR output, then hydrate
  // from localStorage on the client in an effect to avoid hydration mismatch.
  const [jobs, setJobs] = useState<Job[]>(initialJobs)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('escribe-jobs')
      if (stored) setJobs(JSON.parse(stored) as Job[])
    } catch {
      // localStorage unavailable — keep initialJobs
    }
  }, [])

  // Keep storage in sync whenever jobs change.
  useEffect(() => {
    jobsService.save(jobs)
  }, [jobs])

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev])
  }, [])

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }, [])

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  return (
    <JobsContext.Provider value={{ jobs, addJob, updateJob, deleteJob }}>
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext)
  if (!ctx) {
    throw new Error('useJobs must be used inside <JobsProvider>')
  }
  return ctx
}
