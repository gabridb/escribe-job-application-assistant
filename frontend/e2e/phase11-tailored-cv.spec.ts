import { test, expect } from '@playwright/test'

const JOB_ID = 'cv-job-1'

const mockJob = {
  id: JOB_ID,
  title: 'Senior Software Engineer',
  company: 'Acme Corp',
  description: 'We are looking for a senior software engineer with strong TypeScript experience.',
  status: 'active',
  createdAt: '2026-04-13',
}

const CV_TEXT = 'Senior Software Engineer with 8 years of experience in TypeScript and React.'

test('editor textarea is visible on CV page', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  await expect(page.getByTestId('editor-textarea')).toBeVisible({ timeout: 8000 })
})

test('typing in editor triggers PUT /api/jobs/:jobId/cv', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 404, body: '' })
    }
    return route.fulfill({
      json: { id: 'tcv-1', jobId: JOB_ID, text: CV_TEXT, updatedAt: '2026-04-13' },
    })
  })
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  const putPromise = page.waitForRequest(
    (req) => req.url().includes(`/api/jobs/${JOB_ID}/cv`) && req.method() === 'PUT',
  )

  await page.goto(`/jobs/${JOB_ID}/cv`)

  const editor = page.getByTestId('editor-textarea')
  await expect(editor).toBeVisible({ timeout: 8000 })
  await editor.fill(CV_TEXT)

  const putRequest = await putPromise
  const body = putRequest.postDataJSON()
  expect(body).toMatchObject({ text: CV_TEXT })
})

test('editor content persists after reload', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) => {
    return route.fulfill({
      json: { id: 'tcv-1', jobId: JOB_ID, text: CV_TEXT, updatedAt: '2026-04-13' },
    })
  })
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  const editor = page.getByTestId('editor-textarea')
  await expect(editor).toHaveValue(CV_TEXT, { timeout: 8000 })
})

test('sending a chat message includes context cv and jobDescription', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/chat', (route) =>
    route.fulfill({ json: { content: 'Here are some suggestions to tailor your CV...' } }),
  )

  const chatPromise = page.waitForRequest((req) => req.url().includes('/api/chat'))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  const editor = page.getByTestId('editor-textarea')
  await expect(editor).toBeVisible({ timeout: 8000 })

  await page.getByPlaceholder('Ask AI to modify your document...').fill('What should I emphasise?')
  await page.getByRole('button', { name: 'Send' }).click()

  const chatRequest = await chatPromise
  const body = chatRequest.postDataJSON()
  expect(body.context).toBe('cv')
  expect(body.jobDescription).toBe(mockJob.description)
})

test('"Want me to write a first draft for you?" card is visible', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  await expect(page.getByTestId('editor-textarea')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('Want me to write a first draft for you?')).toBeVisible()
})

test('clicking "Tailor my CV for this role" fires POST /api/chat with cv context', async ({
  page,
}) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cv`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
  await page.route('**/api/chat', (route) =>
    route.fulfill({ json: { content: 'Here is a tailored CV draft...' } }),
  )

  const chatPromise = page.waitForRequest((req) => req.url().includes('/api/chat'))

  await page.goto(`/jobs/${JOB_ID}/cv`)

  await expect(page.getByTestId('editor-textarea')).toBeVisible({ timeout: 8000 })
  await page.getByRole('button', { name: 'Tailor my CV for this role' }).click()

  const chatRequest = await chatPromise
  const body = chatRequest.postDataJSON()
  expect(body.context).toBe('cv')
})
