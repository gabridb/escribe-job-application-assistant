'use client'

import { useEffect, useState } from 'react'
import { cvService, CvDocument } from '@/lib/services/cv-service'

export default function CvViewPage() {
  const [cv, setCv] = useState<CvDocument | null | undefined>(undefined)

  useEffect(() => {
    cvService.get().then(setCv)
  }, [])

  if (cv === undefined) return null

  if (!cv) {
    return (
      <main className="p-8">
        <p className="text-stone-500">No CV uploaded.</p>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold text-stone-800 mb-4">{cv.name}</h1>
      <pre className="whitespace-pre-wrap text-sm text-stone-700 font-mono">{cv.text}</pre>
    </main>
  )
}
