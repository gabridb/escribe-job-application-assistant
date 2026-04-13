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
  updateJob: (id: string, patch: Partial<Job>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  refreshJobs: () => Promise<void>
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

  const updateJob = useCallback(async (id: string, patch: Partial<Job>) => {
    const updated = await jobsService.update(id, patch)
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updated } : j)))
  }, [])

  const deleteJob = useCallback(async (id: string) => {
    await jobsService.delete(id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const refreshJobs = useCallback(async () => {
    const fresh = await jobsService.getAll()
    setJobs(fresh)
  }, [])

  return (
    <JobsContext.Provider value={{ jobs, addJob, updateJob, deleteJob, refreshJobs }}>
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
