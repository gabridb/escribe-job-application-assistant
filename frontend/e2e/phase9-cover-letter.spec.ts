import { test, expect } from '@playwright/test'

const JOB_ID = 'cl-job-1'

const mockJob = {
  id: JOB_ID,
  title: 'Product Manager',
  company: 'Globex Corp',
  description: 'Looking for an experienced product manager.',
  status: 'active',
  createdAt: '2026-04-11',
}

const COVER_LETTER_TEXT = 'Dear Hiring Manager, I am excited to apply for this role.'

test('editor textarea is visible on cover letter page', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)

  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })
})

test('typing in editor triggers PUT /api/jobs/:jobId/cover-letter', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 404, body: '' })
    }
    return route.fulfill({
      json: { id: 'cl-1', jobId: JOB_ID, text: COVER_LETTER_TEXT, updatedAt: '2026-04-11' },
    })
  })
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  const putPromise = page.waitForRequest(
    (req) =>
      req.url().includes(`/api/jobs/${JOB_ID}/cover-letter`) && req.method() === 'PUT',
  )

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)

  const editor = page.getByTestId('editor-content')
  await expect(editor).toBeVisible({ timeout: 8000 })
  await editor.fill(COVER_LETTER_TEXT)

  const putRequest = await putPromise
  const body = putRequest.postDataJSON()
  expect(body).toMatchObject({ text: COVER_LETTER_TEXT })
})

test('editor content persists after reload', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        json: { id: 'cl-1', jobId: JOB_ID, text: COVER_LETTER_TEXT, updatedAt: '2026-04-11' },
      })
    }
    return route.fulfill({
      json: { id: 'cl-1', jobId: JOB_ID, text: COVER_LETTER_TEXT, updatedAt: '2026-04-11' },
    })
  })
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)

  const editor = page.getByTestId('editor-content')
  await expect(editor).toContainText(COVER_LETTER_TEXT, { timeout: 8000 })
})

test('sending a chat message includes context cover-letter and jobDescription', async ({
  page,
}) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/chat', (route) =>
    route.fulfill({ json: { content: 'Here is a strong opening paragraph...' } }),
  )

  const chatPromise = page.waitForRequest((req) => req.url().includes('/api/chat'))

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)

  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })

  await page.getByPlaceholder('Ask AI to modify your document...').fill('Help me write an opening paragraph')
  await page.getByRole('button', { name: 'Send' }).click()

  const chatRequest = await chatPromise
  const body = chatRequest.postDataJSON()
  expect(body.context).toBe('cover-letter')
  expect(body.jobDescription).toBe(mockJob.description)
})

test('"Want me to write a first draft for you?" card is visible', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)

  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('Want me to write a first draft for you?')).toBeVisible()
})

test('clicking "Write my cover letter" fires POST /api/chat with cover-letter context', async ({
  page,
}) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/chat', (route) =>
    route.fulfill({ json: { content: 'Here is a complete cover letter draft...' } }),
  )

  const chatPromise = page.waitForRequest((req) => req.url().includes('/api/chat'))

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)

  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Write my cover letter' }).click()

  const chatRequest = await chatPromise
  const body = chatRequest.postDataJSON()
  expect(body.context).toBe('cover-letter')
})
