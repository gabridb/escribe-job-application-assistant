import { test, expect } from '@playwright/test'

test('writing assistant renders split-screen layout', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  // chat panel
  await expect(page.getByText('AI Assistant')).toBeVisible()
  // editor panel
  await expect(page.getByPlaceholder('Start writing here...')).toBeVisible()
})

test('editor textarea accepts text input', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const editor = page.getByPlaceholder('Start writing here...')
  await editor.fill('My relevant experience story')
  await expect(editor).toHaveValue('My relevant experience story')
})

test('chat sends user message and receives mock AI reply', async ({ page }) => {
  await page.goto('/jobs/job-1/themes/theme-1-1')
  const chatInput = page.getByPlaceholder('Ask AI to modify your document...')
  await chatInput.fill('Can you help me improve this?')
  await chatInput.press('Enter')
  await expect(page.getByText('Can you help me improve this?')).toBeVisible()
  await expect(page.getByText(/STAR method/i)).toBeVisible({ timeout: 2000 })
})

test('cover letter page shows Cover Letter label', async ({ page }) => {
  await page.goto('/jobs/job-1/cover-letter')
  await expect(page.getByRole('heading', { name: 'Cover Letter' })).toBeVisible()
})

test('cv page shows Tailored CV label', async ({ page }) => {
  await page.goto('/jobs/job-1/cv')
  await expect(page.getByRole('heading', { name: 'Tailored CV' })).toBeVisible()
})
