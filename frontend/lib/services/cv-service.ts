// CV Service — storage abstraction layer.
// Currently backed by localStorage. When a backend is ready, replace
// the localStorage calls below with fetch/API calls; the hook and
// components above this layer need no changes.

export interface CvDocument {
  name: string
  text: string
  uploadedAt: string
}

const STORAGE_KEY = 'escribe-cv'

export const cvService = {
  async save(cv: CvDocument): Promise<void> {
    // TODO(backend): POST /api/cv  →  body: cv
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cv))
  },

  async get(): Promise<CvDocument | null> {
    // TODO(backend): GET /api/cv  →  return parsed response body
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CvDocument) : null
  },

  async remove(): Promise<void> {
    // TODO(backend): DELETE /api/cv
    localStorage.removeItem(STORAGE_KEY)
  },
}
