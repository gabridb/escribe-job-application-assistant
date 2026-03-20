import { test, expect } from '@playwright/test'

function seedJob(page: import('@playwright/test').Page, jobId = 'test-job-1') {
  return page.evaluate((id) => {
    const job = {
      id,
      title: 'Engineering Lead',
      company: 'Test Corp',
      description: 'We are looking for an Engineering Lead.',
      status: 'active',
      createdAt: '2026-03-18',
    }
    const themes = [
      { id: `${id}-theme-1`, jobId: id, name: 'Leadership', description: 'Lead teams.', status: 'todo' },
      { id: `${id}-theme-2`, jobId: id, name: 'Problem Solving', description: 'Solve problems.', status: 'todo' },
    ]
    localStorage.setItem('escribe-jobs', JSON.stringify([job]))
    localStorage.setItem('escribe_themes', JSON.stringify(themes))
  }, jobId)
}

test('clicking a job navigates to its themes page', async ({ page }) => {
  await page.goto('/')
  await seedJob(page)
  await page.reload()

  await page.getByRole('link', { name: /key themes/i }).first().click()
  await expect(page).toHaveURL(/\/jobs\/.+\/themes/)
})

test('adding a new job auto-generates themes', async ({ page }) => {
  await page.goto('/')
  await seedJob(page)
  await page.reload()

  await page.getByRole('link', { name: /key themes/i }).first().click()
  await expect(page).toHaveURL(/\/jobs\/.+\/themes/)

  // Themes were generated — all start as "To Do"
  await expect(page.getByText('To Do').first()).toBeVisible()
})
