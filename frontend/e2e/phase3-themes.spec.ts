import { test, expect } from '@playwright/test'

test('clicking a job navigates to its themes page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /key themes/i }).first().click()
  await expect(page).toHaveURL(/\/jobs\/.+\/themes/)
})

test('themes page shows theme list with status badges', async ({ page }) => {
  await page.goto('/jobs/job-1/themes')
  await expect(page.getByText('Leadership')).toBeVisible()
  await expect(page.getByText('Done')).toBeVisible()
})

test('adding a new job auto-generates themes', async ({ page }) => {
  await page.goto('/jobs/new')
  await page.getByRole('textbox').fill('New Job Title\nNew Company\n\nWe are looking for a great candidate.')
  await page.getByRole('button', { name: /add job offer/i }).click()
  // Wait for processing to complete and redirect to dashboard
  await expect(page).toHaveURL('/', { timeout: 6000 })
  // navigate to the new job's themes — new jobs are at the top
  await page.getByRole('link', { name: /key themes/i }).first().click()
  await expect(page.getByText('Leadership')).toBeVisible()
  await expect(page.getByText('Problem Solving')).toBeVisible()
})
