import { test, expect } from '@playwright/test'

test('add job via dialog → processing screen → appears at top → Key Themes shows themes', async ({ page }) => {
  await page.goto('/')

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
  await expect(page.getByText(/Staff Engineer/)).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(/BigCo/)).toBeVisible({ timeout: 10000 })

  // Auto-redirects to dashboard once AI processing completes
  await expect(page).toHaveURL('/', { timeout: 20000 })

  // New job is FIRST row
  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow).toContainText('Staff Engineer')
  await expect(firstRow).toContainText('BigCo')

  // Navigate to Key Themes
  await firstRow.getByRole('link', { name: /key themes/i }).click()
  await expect(page).toHaveURL(/\/jobs\/.+\/themes/)
  await expect(page.getByText('Key Interview Themes')).toBeVisible()
  // Themes were AI-generated — all start as "To Do"
  await expect(page.getByText('To Do').first()).toBeVisible()
})
