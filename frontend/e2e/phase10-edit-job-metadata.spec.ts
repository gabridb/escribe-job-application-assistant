import { test, expect } from '@playwright/test'

const JOB_ID = 'job-edit-1'

const mockJob = {
  id: JOB_ID,
  title: 'Platform Engineer',
  company: '',
  description: 'Looking for a platform engineer.',
  status: 'active',
  createdAt: '2026-04-13',
}

test('edit button opens dialog pre-filled with job title and company', async ({ page }) => {
  await page.route('**/api/jobs', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [mockJob] })
    return route.continue()
  })

  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Edit Platform Engineer' })).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Edit Platform Engineer' }).click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Edit Job')
  await expect(page.getByRole('dialog').getByLabel('Title')).toHaveValue('Platform Engineer')
  await expect(page.getByRole('dialog').getByLabel(/Company/)).toHaveValue('')
})

test('saving edited company calls PATCH and updates the row', async ({ page }) => {
  const updatedJob = { ...mockJob, company: 'TechCorp' }
  let patchBody: Record<string, unknown> = {}

  await page.route('**/api/jobs', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [mockJob] })
    return route.continue()
  })
  await page.route(`**/api/jobs/${JOB_ID}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      patchBody = JSON.parse(route.request().postData() ?? '{}')
      return route.fulfill({ json: updatedJob })
    }
    return route.fulfill({ json: mockJob })
  })

  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Edit Platform Engineer' })).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Edit Platform Engineer' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('dialog').getByLabel(/Company/).fill('TechCorp')

  const patchRequest = page.waitForRequest(
    (req) => req.url().includes(`/api/jobs/${JOB_ID}`) && req.method() === 'PATCH',
  )
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await patchRequest

  expect(patchBody).toMatchObject({ company: 'TechCorp' })
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('cell', { name: 'TechCorp' })).toBeVisible()
})

test('save button is disabled when title is cleared', async ({ page }) => {
  await page.route('**/api/jobs', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [mockJob] })
    return route.continue()
  })

  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Edit Platform Engineer' })).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Edit Platform Engineer' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('dialog').getByLabel('Title').clear()

  await expect(page.getByRole('dialog').getByRole('button', { name: 'Save' })).toBeDisabled()
})

test('cancel closes dialog without calling PATCH', async ({ page }) => {
  let patchCalled = false

  await page.route('**/api/jobs', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [mockJob] })
    return route.continue()
  })
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => {
    if (route.request().method() === 'PATCH') {
      patchCalled = true
      return route.fulfill({ json: mockJob })
    }
    return route.fulfill({ json: mockJob })
  })

  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Edit Platform Engineer' })).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Edit Platform Engineer' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('dialog').getByLabel('Title').fill('Changed Title')
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(patchCalled).toBe(false)
  await expect(page.getByRole('cell', { name: 'Platform Engineer', exact: true })).toBeVisible()
})
