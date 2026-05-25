import { test, expect } from '@playwright/test'

const JOB_ID = 'dashboard-row-job-1'

const mockJob = {
  id: JOB_ID,
  title: 'Lead Designer',
  company: 'Initech',
  description: 'Hiring a lead designer.',
  status: 'active',
  createdAt: '2026-05-23',
}

test('clicking the dashboard row title opens the job overview', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))

  await page.goto('/')
  await page.getByTestId(`job-row-title-${JOB_ID}`).click()

  await expect(page).toHaveURL(`/jobs/${JOB_ID}`)
  await expect(page.getByRole('heading', { name: 'Lead Designer' })).toBeVisible()
})

test('the dashboard no longer has a "Key Themes" column', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))

  await page.goto('/')
  await expect(page.getByRole('columnheader', { name: 'Key Themes' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Key Themes' })).toHaveCount(0)
})
