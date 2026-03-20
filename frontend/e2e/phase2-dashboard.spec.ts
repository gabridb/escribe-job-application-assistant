import { test, expect } from '@playwright/test'

// MTI 1 + 2: Dashboard renders and shows the Add Job Offer button
test('dashboard renders with Add Job Offer button', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [] }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: /add job offer/i })).toBeVisible()
})

// MTI 3: "Add Job Offer" button opens the dialog
test('Add Job Offer button opens dialog', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [] }))
  await page.goto('/')
  await page.getByRole('button', { name: /add job offer/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

// MTI 4: /jobs/new renders the form
test('add job offer form renders with textarea', async ({ page }) => {
  await page.goto('/jobs/new')
  await expect(page.getByText('Add a new job offer')).toBeVisible()
  await expect(page.getByPlaceholder('Paste or type a job offer here')).toBeVisible()
  await expect(page.getByRole('button', { name: /add job offer/i })).toBeVisible()
})

// MTI 5: Submitting the form adds the job and redirects to themes page
test('submitting the form adds job and navigates to themes', async ({ page }) => {
  const jobId = 'new-job-dashboard-test'

  await page.route('**/api/jobs', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] })
    }
    return route.fulfill({
      json: {
        id: jobId,
        title: 'Head of Engineering',
        company: 'Acme Corp',
        description: 'We are looking for a strong engineering leader.',
        status: 'active',
        createdAt: '2026-03-20',
        themes: [
          { id: 'theme-1', jobId, name: 'Leadership', description: 'Lead teams.', status: 'todo' },
        ],
      },
    })
  })
  await page.route(`**/api/jobs/${jobId}/themes`, (route) =>
    route.fulfill({
      json: [{ id: 'theme-1', jobId, name: 'Leadership', description: 'Lead teams.', status: 'todo' }],
    })
  )

  await page.goto('/jobs/new')

  const textarea = page.getByPlaceholder('Paste or type a job offer here')
  await textarea.fill('Head of Engineering\nAcme Corp\n\nWe are looking for a strong engineering leader.')

  await page.getByRole('button', { name: /add job offer/i }).click()

  // Redirects to themes page after backend responds
  await expect(page).toHaveURL(`/jobs/${jobId}/themes`, { timeout: 10000 })
  await expect(page.getByRole('heading', { name: 'Key Interview Themes' })).toBeVisible()
})
