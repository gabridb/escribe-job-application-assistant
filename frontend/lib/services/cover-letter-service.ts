// Cover Letter Service — fetch-based abstraction over the NestJS backend.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface CoverLetter {
  id: string
  jobId: string
  text: string
  updatedAt: string
}

export const coverLetterService = {
  async get(jobId: string): Promise<CoverLetter | null> {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}/cover-letter`, { cache: 'no-store' })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async upsert(jobId: string, text: string): Promise<CoverLetter> {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/cover-letter`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      throw new Error(`Failed to save cover letter: ${res.status}`)
    }
    return res.json()
  },
}
