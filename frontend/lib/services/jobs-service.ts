// Jobs Service — storage abstraction layer.
// Currently backed by localStorage. When a backend is ready, replace
// the localStorage calls below with fetch/API calls; the context and
// components above this layer need no changes.

import type { Job } from '@/lib/mock/jobs'

const STORAGE_KEY = 'escribe-jobs'

export const jobsService = {
  async getAll(): Promise<Job[]> {
    // TODO(backend): GET /api/jobs  →  return parsed response body
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Job[]) : []
    } catch {
      return []
    }
  },

  async save(jobs: Job[]): Promise<void> {
    // TODO(backend): PUT /api/jobs  →  body: jobs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
    } catch {
      // localStorage unavailable — silently ignore
    }
  },
}
