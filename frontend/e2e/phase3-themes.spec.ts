import { test, expect } from '@playwright/test'

const JOB_ID = 'test-job-1'

const mockThemes = [
  { id: `${JOB_ID}-theme-1`, jobId: JOB_ID, name: 'Leadership', description: 'Lead teams.', status: 'todo' },
  { id: `${JOB_ID}-theme-2`, jobId: JOB_ID, name: 'Problem Solving', description: 'Solve problems.', status: 'todo' },
]

test('themes page renders job themes from backend', async ({ page }) => {
  // Themes are fetched client-side — page.route intercepts browser requests
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: mockThemes }))
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [] }))

  await page.goto(`/jobs/${JOB_ID}/themes`)

  await expect(page.getByText('Leadership')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('Problem Solving')).toBeVisible()
})

test('navigating to themes page shows Key Interview Themes heading', async ({ page }) => {
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: mockThemes }))
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [] }))

  await page.goto(`/jobs/${JOB_ID}/themes`)

  await expect(page).toHaveURL(/\/jobs\/.+\/themes/)
  await expect(page.getByRole('heading', { name: 'Key Interview Themes' })).toBeVisible()
})

test('themes all start as To Do status', async ({ page }) => {
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: mockThemes }))
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [] }))

  await page.goto(`/jobs/${JOB_ID}/themes`)

  await expect(page.getByText('To Do').first()).toBeVisible({ timeout: 8000 })
})
