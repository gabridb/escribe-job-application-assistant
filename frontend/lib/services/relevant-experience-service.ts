const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface RelevantExperience {
  themeId: string
  text: string
  updatedAt: string
}

export const relevantExperienceService = {
  async get(jobId: string, themeId: string): Promise<RelevantExperience | null> {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}/themes/${themeId}/experience`, {
        cache: 'no-store',
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  async upsert(jobId: string, themeId: string, text: string): Promise<RelevantExperience> {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/themes/${themeId}/experience`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      throw new Error(`Failed to save relevant experience: ${res.status}`)
    }
    return res.json()
  },
}
