import { test, expect } from '@playwright/test'

test('add job via dialog → processing screen → appears at top → Key Themes shows themes', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.removeItem('escribe-jobs')
    localStorage.removeItem('escribe_themes')
  })
  await page.reload()

  // Open dialog and submit
  await page.getByRole('button', { name: /\+ add job offer/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByPlaceholder('Paste or type a job offer here').fill(
    'Staff Engineer\nBigCo\n\nWe are looking for a Staff Engineer to lead platform work.'
  )
  await page.getByRole('button', { name: /add job offer/i }).click()

  // Processing screen
  await expect(page).toHaveURL(/\/jobs\/.+\/processing/)
  await expect(page.getByText(/analysing your job offer/i)).toBeVisible()
  await expect(page.getByText(/Staff Engineer/)).toBeVisible({ timeout: 2000 })
  await expect(page.getByText(/BigCo/)).toBeVisible({ timeout: 2000 })

  // Auto-redirects to dashboard
  await expect(page).toHaveURL('/', { timeout: 6000 })

  // New job is FIRST row
  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow).toContainText('Staff Engineer')
  await expect(firstRow).toContainText('BigCo')

  // Navigate to Key Themes
  await firstRow.getByRole('link', { name: /key themes/i }).click()
  await expect(page).toHaveURL(/\/jobs\/.+\/themes/)
  await expect(page.getByText('Key Interview Themes')).toBeVisible()
  await expect(page.getByText('Leadership')).toBeVisible()
  await expect(page.getByText('Problem Solving')).toBeVisible()
})
