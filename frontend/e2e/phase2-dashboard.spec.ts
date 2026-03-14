import { test, expect } from '@playwright/test'

// MTI 1 + 2: getMockJobs() returns data and the Dashboard renders job rows
test('dashboard shows job offer rows with title and company', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Senior Frontend Developer')).toBeVisible()
  await expect(page.getByText('TechCorp Inc.')).toBeVisible()
  await expect(page.getByText('UX Designer')).toBeVisible()
  await expect(page.getByText('Design Studio')).toBeVisible()
})

// MTI 3: "Add Job Offer" button navigates to /jobs/new
test('Add Job Offer button opens dialog', async ({ page }) => {
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

// MTI 5: Submitting the form adds the job and redirects to /
test('submitting the form adds job and shows it on the dashboard', async ({ page }) => {
  // Clear localStorage so we start from a known state
  await page.goto('/')
  await page.evaluate(() => localStorage.removeItem('escribe-jobs'))

  await page.goto('/jobs/new')

  const textarea = page.getByPlaceholder('Paste or type a job offer here')
  await textarea.fill('Head of Engineering\nAcme Corp\n\nWe are looking for a strong engineering leader.')

  await page.getByRole('button', { name: /add job offer/i }).click()

  // Should redirect to dashboard
  await expect(page).toHaveURL('/', { timeout: 6000 })

  // New job should be visible
  await expect(page.getByText('Head of Engineering')).toBeVisible()
  await expect(page.getByText('Acme Corp')).toBeVisible()
})
