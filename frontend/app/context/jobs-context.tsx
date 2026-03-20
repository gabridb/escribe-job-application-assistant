'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import type { Job } from '@/lib/mock/jobs'
import { jobsService } from '@/lib/services/jobs-service'

interface JobsContextValue {
  jobs: Job[]
  addJob: (job: Job) => void
  updateJob: (id: string, patch: Partial<Job>) => void
  deleteJob: (id: string) => Promise<void>
}

const JobsContext = createContext<JobsContextValue | null>(null)

export function JobsProvider({
  initialJobs,
  children,
}: {
  initialJobs: Job[]
  children: React.ReactNode
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev])
  }, [])

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }, [])

  const deleteJob = useCallback(async (id: string) => {
    await jobsService.delete(id)
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
