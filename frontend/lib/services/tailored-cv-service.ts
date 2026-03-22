// Tailored CV Service — fetch-based abstraction over the NestJS backend.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface TailoredCv {
  id: string
  jobId: string
  text: string
  updatedAt: string
}

export const tailoredCvService = {
  async get(jobId: string): Promise<TailoredCv | null> {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}/cv`, { cache: 'no-store' })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async upsert(jobId: string, text: string): Promise<TailoredCv> {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/cv`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      throw new Error(`Failed to save tailored CV: ${res.status}`)
    }
    return res.json()
  },
}
