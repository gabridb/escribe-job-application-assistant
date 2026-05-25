import { test, expect } from '@playwright/test'

const JOB_ID = 'overview-job-1'

const mockJob = {
  id: JOB_ID,
  title: 'Staff Engineer',
  company: 'Globex',
  description: 'We are hiring a Staff Engineer.',
  status: 'active',
  createdAt: '2026-05-23',
}

const mockThemes = [
  { id: 'theme-a', jobId: JOB_ID, name: 'Technical Leadership', description: 'Lead tech work.', status: 'todo' },
  { id: 'theme-b', jobId: JOB_ID, name: 'Stakeholder Management', description: 'Align stakeholders.', status: 'todo' },
]

async function mockApi(page: import('@playwright/test').Page, withListedJob = true) {
  await page.route('**/api/jobs', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: withListedJob ? [mockJob] : [] })
    }
    return route.fulfill({ json: { ...mockJob, themes: mockThemes } })
  })
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: mockThemes }))
}

test('after submitting the new-job dialog, the URL is /jobs/:jobId and the overview renders', async ({ page }) => {
  await mockApi(page, false)

  await page.goto('/')
  await page.getByRole('button', { name: /\+ add job offer/i }).click()
  await page
    .getByPlaceholder('Paste or type a job offer here')
    .fill('Staff Engineer at Globex — we want strong technical leadership.')

  await page.getByRole('dialog').getByRole('button', { name: /add job offer/i }).click()

  await expect(page).toHaveURL(`/jobs/${JOB_ID}`, { timeout: 10000 })
  await expect(page.getByRole('heading', { name: 'Staff Engineer' })).toBeVisible()
  await expect(page.getByText('Globex')).toBeVisible()
  await expect(page.getByTestId('cta-cover-letter')).toBeVisible()
  await expect(page.getByTestId('cta-cv')).toBeVisible()
  await expect(page.getByTestId('cta-themes')).toBeVisible()
})

test('clicking "Write Cover Letter" on the job overview navigates to /jobs/:jobId/cover-letter', async ({ page }) => {
  await mockApi(page)
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route(`**/api/jobs/${JOB_ID}/themes/theme-a/experience`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes/theme-b/experience`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )

  await page.goto(`/jobs/${JOB_ID}`)
  await page.getByTestId('cta-cover-letter').click()

  await expect(page).toHaveURL(`/jobs/${JOB_ID}/cover-letter`)
})

test('clicking "Interview themes" on the job overview navigates to /jobs/:jobId/themes', async ({ page }) => {
  await mockApi(page)

  await page.goto(`/jobs/${JOB_ID}`)
  await page.getByTestId('cta-themes').click()

  await expect(page).toHaveURL(`/jobs/${JOB_ID}/themes`)
  await expect(page.getByRole('heading', { name: 'Key Interview Themes' })).toBeVisible()
})
