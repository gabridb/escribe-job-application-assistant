import { test, expect } from '@playwright/test'

// Integration tests — no mocks, hits the real backend + database.
// Requires `npm run dev` (from repo root) to be running before executing.

const BACKEND = 'http://localhost:3001'

let jobId: string
let themeId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request }) => {
  const res = await request.post(`${BACKEND}/api/jobs`, {
    data: {
      description:
        'Senior Platform Engineer at Acme Corp. Key skills: cloud infrastructure, Kubernetes, CI/CD pipelines, team leadership. 5+ years experience required.',
    },
  })
  expect(res.ok()).toBeTruthy()
  const job = await res.json()
  jobId = job.id
  themeId = job.themes[0].id
})

test('relevant experience persists after navigation', async ({ page }) => {
  await page.goto(`/jobs/${jobId}/themes/${themeId}`)

  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })

  const text = `relevant-experience-${Date.now()}`
  await editor.fill(text)
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 })

  await page.goto(`/jobs/${jobId}/themes`)
  await page.goto(`/jobs/${jobId}/themes/${themeId}`)

  await expect(editor).toContainText(text, { timeout: 5000 })
})

test('tailored CV persists after navigation', async ({ page }) => {
  await page.goto(`/jobs/${jobId}/cv`)

  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })

  const text = `cv-content-${Date.now()}`
  await editor.fill(text)
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 })

  await page.goto(`/jobs/${jobId}/themes`)
  await page.goto(`/jobs/${jobId}/cv`)

  await expect(editor).toContainText(text, { timeout: 5000 })
})
