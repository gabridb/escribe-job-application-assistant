import { test, expect } from '@playwright/test'

// Base CV: pre-fill tailored CV editor from base CV when no tailored CV exists
// Base CV: view CV in new tab from user menu dropdown

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

  const editor = page.getByTestId('editor-content')
  await expect(editor).toContainText('My Base CV', { timeout: 8000 })
  await expect(editor).toContainText('Experienced engineer with 5 years in TypeScript.')
})

test('"View CV" item appears in user menu dropdown when CV exists', async ({ page }) => {
  await page.route('**/api/cv', (route) =>
    route.fulfill({ json: { id: 'cv-1', name: 'my-cv.pdf', text: BASE_CV_TEXT, uploadedAt: '2026-03-23' } })
  )

  await page.goto('/')
  await page.getByRole('button', { name: 'Profile' }).click()

  await expect(page.getByRole('menuitem', { name: 'View CV' })).toBeVisible()
})

test('"View CV" item does not appear in user menu dropdown when no CV exists', async ({ page }) => {
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto('/')
  await page.getByRole('button', { name: 'Profile' }).click()

  await expect(page.getByRole('menuitem', { name: 'View CV' })).not.toBeVisible()
})

test('"View CV" opens new tab showing CV filename and text', async ({ page }) => {
  await page.context().route('**/api/cv', (route) =>
    route.fulfill({ json: { id: 'cv-1', name: 'my-cv.pdf', text: BASE_CV_TEXT, uploadedAt: '2026-03-23' } })
  )

  await page.goto('/')
  await page.getByRole('button', { name: 'Profile' }).click()

  const [newTab] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByRole('menuitem', { name: 'View CV' }).click(),
  ])

  await newTab.waitForLoadState()
  await expect(newTab).toHaveURL(/\/cv\/view/)
  await expect(newTab.getByRole('heading', { name: 'my-cv.pdf' })).toBeVisible()
  await expect(newTab.getByText('Experienced engineer')).toBeVisible()
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

  const editor = page.getByTestId('editor-content')
  await expect(editor).toContainText('Tailored for Acme', { timeout: 8000 })
  await expect(editor).toContainText('Customised content for this role.')
  await expect(editor).not.toContainText('My Base CV')
})
