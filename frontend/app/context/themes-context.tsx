'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import type { Theme, ThemeStatus } from '@/lib/mock/themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ThemesContextValue {
  themes: Theme[]
  addThemes: (themes: Theme[]) => void
  loadThemes: (themes: Theme[]) => void
  updateThemeStatus: (id: string, status: ThemeStatus) => Promise<void>
}

const ThemesContext = createContext<ThemesContextValue | null>(null)

export function ThemesProvider({
  initialThemes,
  children,
}: {
  initialThemes: Theme[]
  children: React.ReactNode
}) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)

  const addThemes = useCallback((newThemes: Theme[]) => {
    setThemes((prev) => [...prev, ...newThemes])
  }, [])

  // Replace themes for a given jobId (used when navigating to the themes page).
  const loadThemes = useCallback((incoming: Theme[]) => {
    if (incoming.length === 0) return
    const jobId = incoming[0].jobId
    setThemes((prev) => [
      ...prev.filter((t) => t.jobId !== jobId),
      ...incoming,
    ])
  }, [])

  const updateThemeStatus = useCallback(async (id: string, status: ThemeStatus) => {
    await fetch(`${API_URL}/api/themes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    )
  }, [])

  return (
    <ThemesContext.Provider value={{ themes, addThemes, loadThemes, updateThemeStatus }}>
      {children}
    </ThemesContext.Provider>
  )
}

export function useThemes(): ThemesContextValue {
  const ctx = useContext(ThemesContext)
  if (!ctx) {
    throw new Error('useThemes must be used inside <ThemesProvider>')
  }
  return ctx
}
