import { test, expect } from '@playwright/test'

// Base CV: pre-fill tailored CV editor from base CV when no tailored CV exists

const JOB_ID = 'bcv-job-1'

const mockJob = {
  id: JOB_ID,
  title: 'Software Engineer',
  company: 'Acme Ltd',
  description: 'Looking for a software engineer.',
  status: 'active',
  createdAt: '2026-03-23',
}

const BASE_CV_TEXT = '# My Base CV\n\nExperienced engineer with 5 years in TypeScript.'
const TAILORED_CV_TEXT = '# Tailored for Acme\n\nCustomised content for this role.'

test('editor pre-fills with base CV when no tailored CV exists', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/cv', (route) =>
    route.fulfill({ json: { id: 'cv-1', name: 'base.md', text: BASE_CV_TEXT, uploadedAt: '2026-03-23' } })
  )

  await page.goto(`/jobs/${JOB_ID}/cv`)

  const editor = page.getByTestId('editor-textarea')
  await expect(editor).toHaveValue(BASE_CV_TEXT, { timeout: 8000 })
})

test('editor shows tailored CV (not base CV) when tailored CV already exists', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) =>
    route.fulfill({ json: { id: 'tcv-1', jobId: JOB_ID, text: TAILORED_CV_TEXT, updatedAt: '2026-03-23' } })
  )
  await page.route('**/api/cv', (route) =>
    route.fulfill({ json: { id: 'cv-1', name: 'base.md', text: BASE_CV_TEXT, uploadedAt: '2026-03-23' } })
  )

  await page.goto(`/jobs/${JOB_ID}/cv`)

  const editor = page.getByTestId('editor-textarea')
  await expect(editor).toHaveValue(TAILORED_CV_TEXT, { timeout: 8000 })
})
