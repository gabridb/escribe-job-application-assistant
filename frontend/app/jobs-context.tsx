'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Job } from '@/lib/mock/jobs'

const STORAGE_KEY = 'escribe-jobs'

interface JobsContextValue {
  jobs: Job[]
  addJob: (job: Job) => void
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
  // Initialise from localStorage if it exists, otherwise fall back to the
  // seed data passed from the server.
  const [jobs, setJobs] = useState<Job[]>(() => {
    if (typeof window === 'undefined') return initialJobs
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Job[]) : initialJobs
    } catch {
      return initialJobs
    }
  })

  // Keep localStorage in sync whenever jobs change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [jobs])

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev])
  }, [])

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  return (
    <JobsContext.Provider value={{ jobs, addJob, deleteJob }}>
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
