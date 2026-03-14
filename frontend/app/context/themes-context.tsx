'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Theme } from '@/lib/mock/themes'

const STORAGE_KEY = 'escribe_themes'

interface ThemesContextValue {
  themes: Theme[]
  addThemes: (themes: Theme[]) => void
}

const ThemesContext = createContext<ThemesContextValue | null>(null)

export function ThemesProvider({
  initialThemes,
  children,
}: {
  initialThemes: Theme[]
  children: React.ReactNode
}) {
  // Initialise from localStorage if it exists, otherwise fall back to the
  // seed data passed from the server.
  const [themes, setThemes] = useState<Theme[]>(() => {
    if (typeof window === 'undefined') return initialThemes
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Theme[]) : initialThemes
    } catch {
      return initialThemes
    }
  })

  // Keep localStorage in sync whenever themes change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [themes])

  const addThemes = useCallback((newThemes: Theme[]) => {
    setThemes((prev) => {
      const updated = [...prev, ...newThemes]
      // Write synchronously so localStorage is ready before any navigation
      // that triggers a fresh ThemesProvider mount on the next page.
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // localStorage unavailable — silently ignore
      }
      return updated
    })
  }, [])

  return (
    <ThemesContext.Provider value={{ themes, addThemes }}>
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
