// Jobs Service — fetch-based abstraction over the NestJS backend.

import type { Job } from '@/lib/mock/jobs'
import type { Theme } from '@/lib/mock/themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const jobsService = {
  async getAll(): Promise<Job[]> {
    try {
      const res = await fetch(`${API_URL}/api/jobs`, { cache: 'no-store' })
      if (!res.ok) return []
      return res.json()
    } catch {
      return []
    }
  },

  async getOne(id: string): Promise<Job | null> {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}`, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  },

  async create(description: string): Promise<Job & { themes: Theme[] }> {
    const res = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
    if (!res.ok) {
      throw new Error(`Failed to create job: ${res.status}`)
    }
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_URL}/api/jobs/${id}`, { method: 'DELETE' })
  },
}
