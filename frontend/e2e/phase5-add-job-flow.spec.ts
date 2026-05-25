import { test, expect } from '@playwright/test'

test('add job via dialog → spinner shown → navigates to job overview', async ({ page }) => {
  const jobId = 'new-job-123'
  const jobJson = {
    id: jobId,
    title: 'Staff Engineer',
    company: 'BigCo',
    description: 'We are looking for a Staff Engineer.',
    status: 'active',
    createdAt: '2026-03-20',
  }

  // Mock the backend to return a job with themes immediately
  await page.route('**/api/jobs', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] })
    }
    // POST — return created job + themes
    return route.fulfill({
      json: {
        ...jobJson,
        themes: [
          { id: 'theme-1', jobId, name: 'Technical Leadership', description: 'Lead tech initiatives.', status: 'todo' },
          { id: 'theme-2', jobId, name: 'System Design', description: 'Design scalable systems.', status: 'todo' },
        ],
      },
    })
  })
  await page.route(`**/api/jobs/${jobId}`, (route) => route.fulfill({ json: jobJson }))
  await page.route(`**/api/jobs/${jobId}/themes`, (route) =>
    route.fulfill({
      json: [
        { id: 'theme-1', jobId, name: 'Technical Leadership', description: 'Lead tech initiatives.', status: 'todo' },
        { id: 'theme-2', jobId, name: 'System Design', description: 'Design scalable systems.', status: 'todo' },
      ],
    })
  )

  await page.goto('/')

  // Open dialog
  await page.getByRole('button', { name: /\+ add job offer/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // Fill in description
  await page.getByPlaceholder('Paste or type a job offer here').fill(
    'Staff Engineer\nBigCo\n\nWe are looking for a Staff Engineer to lead platform work.'
  )

  // Submit
  await page.getByRole('dialog').getByRole('button', { name: /add job offer/i }).click()

  // Navigates directly to the job overview page (no processing screen)
  await expect(page).toHaveURL(`/jobs/${jobId}`, { timeout: 10000 })
  await expect(page.getByRole('heading', { name: 'Staff Engineer' })).toBeVisible()
})

test('add job via /jobs/new form → spinner shown → navigates to job overview', async ({ page }) => {
  const jobId = 'new-job-456'
  const jobJson = {
    id: jobId,
    title: 'Staff Engineer',
    company: 'BigCo',
    description: 'We are looking for a Staff Engineer.',
    status: 'active',
    createdAt: '2026-03-20',
  }

  await page.route('**/api/jobs', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] })
    }
    return route.fulfill({
      json: {
        ...jobJson,
        themes: [
          { id: 'theme-1', jobId, name: 'Technical Leadership', description: 'Lead tech initiatives.', status: 'todo' },
        ],
      },
    })
  })
  await page.route(`**/api/jobs/${jobId}`, (route) => route.fulfill({ json: jobJson }))
  await page.route(`**/api/jobs/${jobId}/themes`, (route) =>
    route.fulfill({
      json: [
        { id: 'theme-1', jobId, name: 'Technical Leadership', description: 'Lead tech initiatives.', status: 'todo' },
      ],
    })
  )

  await page.goto('/jobs/new')

  await page.getByPlaceholder('Paste or type a job offer here').fill(
    'Staff Engineer\nBigCo\n\nWe are looking for a Staff Engineer to lead platform work.'
  )

  await page.getByRole('button', { name: /add job offer/i }).click()

  // Navigates directly to the job overview page
  await expect(page).toHaveURL(`/jobs/${jobId}`, { timeout: 10000 })
  await expect(page.getByRole('heading', { name: 'Staff Engineer' })).toBeVisible()
})
