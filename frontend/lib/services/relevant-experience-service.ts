const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface RelevantExperience {
  text: string
  initialGreeting: string
}

export const relevantExperienceService = {
  async get(jobId: string, themeId: string): Promise<RelevantExperience> {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/themes/${themeId}/experience`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error(`Failed to load relevant experience: ${res.status}`)
    }
    return res.json()
  },

  async upsert(jobId: string, themeId: string, text: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/themes/${themeId}/experience`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      throw new Error(`Failed to save relevant experience: ${res.status}`)
    }
  },
}
