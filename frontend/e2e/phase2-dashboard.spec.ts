import { test, expect } from '@playwright/test'

// MTI 1 + 2: Dashboard renders and shows the Add Job Offer button
test('dashboard renders with Add Job Offer button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /add job offer/i })).toBeVisible()
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
  await page.goto('/jobs/new')

  const textarea = page.getByPlaceholder('Paste or type a job offer here')
  await textarea.fill('Head of Engineering\nAcme Corp\n\nWe are looking for a strong engineering leader.')

  await page.getByRole('button', { name: /add job offer/i }).click()

  // Redirects to dashboard after AI processing completes
  await expect(page).toHaveURL('/', { timeout: 15000 })

  // New job row is visible — Key Themes link appears for any job regardless of AI-extracted title
  await expect(page.getByRole('link', { name: 'Key Themes' })).toBeVisible()
})
