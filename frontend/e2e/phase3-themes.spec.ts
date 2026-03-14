import { test, expect } from '@playwright/test'

test('clicking a job navigates to its themes page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /relevant exp/i }).first().click()
  await expect(page).toHaveURL(/\/jobs\/job-1\/themes/)
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
  await expect(page).toHaveURL('/')
  // navigate to the new job's themes — find the last row's Relevant Exp link
  const links = page.getByRole('link', { name: /relevant exp/i })
  const count = await links.count()
  await links.nth(count - 1).click()
  await expect(page.getByText('Leadership')).toBeVisible()
  await expect(page.getByText('Problem Solving')).toBeVisible()
})
