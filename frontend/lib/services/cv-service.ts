// CV Service — fetch-based abstraction over the NestJS backend.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface CvDocument {
  id: string
  name: string
  text: string
  uploadedAt: string
}

export const cvService = {
  async get(): Promise<CvDocument | null> {
    try {
      const res = await fetch(`${API_URL}/api/cv`, { cache: 'no-store' })
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  },

  async save(cv: { name: string; text: string }): Promise<CvDocument> {
    const res = await fetch(`${API_URL}/api/cv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cv),
    })
    if (!res.ok) {
      throw new Error(`Failed to save CV: ${res.status}`)
    }
    return res.json()
  },

  async remove(): Promise<void> {
    await fetch(`${API_URL}/api/cv`, { method: 'DELETE' })
  },
}
