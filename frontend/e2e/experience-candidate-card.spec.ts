import { test, expect } from '@playwright/test'

const JOB_ID = 'candidate-job-1'
const THEME_ID = 'theme-stakeholders'
const THEME_NAME = 'Stakeholder Management'

const mockJob = {
  id: JOB_ID,
  title: 'Product Manager',
  company: 'Globex',
  description: 'Looking for a product manager who can align stakeholders.',
  status: 'active',
  createdAt: '2026-05-23',
}

const mockTheme = {
  id: THEME_ID,
  jobId: JOB_ID,
  name: THEME_NAME,
  description: 'Aligning diverse stakeholders to a single direction.',
  status: 'todo',
}

const CANDIDATE_TEXT = 'Last year I aligned three product leads on a shared roadmap by running a weekly forum.'

async function mockBase(page: import('@playwright/test').Page) {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: [mockJob] }))
  await page.route(`**/api/jobs/${JOB_ID}`, (route) => route.fulfill({ json: mockJob }))
  await page.route(`**/api/jobs/${JOB_ID}/cover-letter`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route(`**/api/jobs/${JOB_ID}/themes`, (route) => route.fulfill({ json: [mockTheme] }))
  await page.route('**/api/cv', (route) => route.fulfill({ status: 404, body: '' }))
}

test('renders a Save/Dismiss card when the AI reply contains an <experience_candidate> tag', async ({ page }) => {
  await mockBase(page)
  await page.route(`**/api/jobs/${JOB_ID}/themes/${THEME_ID}/experience`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 404, body: '' })
    }
    return route.fulfill({ json: { text: CANDIDATE_TEXT } })
  })
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      json: {
        content: `That sounds like a strong story.\n<experience_candidate theme="${THEME_NAME}">${CANDIDATE_TEXT}</experience_candidate>`,
      },
    }),
  )

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)
  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })

  await page.getByPlaceholder('Ask AI to modify your document...').fill('Here is a story for you')
  await page.getByRole('button', { name: 'Send' }).click()

  const card = page.getByTestId('experience-candidate-card')
  await expect(card).toBeVisible({ timeout: 8000 })
  await expect(card).toContainText(THEME_NAME)

  // The raw tag must not be visible in the chat
  await expect(page.getByText('<experience_candidate', { exact: false })).toHaveCount(0)
})

test('clicking Save calls PUT /api/jobs/:jobId/themes/:themeId/experience with the candidate text', async ({
  page,
}) => {
  await mockBase(page)

  const expRequest = page.waitForRequest(
    (req) =>
      req.url().includes(`/api/jobs/${JOB_ID}/themes/${THEME_ID}/experience`) &&
      req.method() === 'PUT',
  )

  await page.route(`**/api/jobs/${JOB_ID}/themes/${THEME_ID}/experience`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 404, body: '' })
    }
    return route.fulfill({ json: { text: CANDIDATE_TEXT } })
  })
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      json: {
        content: `Nice story.\n<experience_candidate theme="${THEME_NAME}">${CANDIDATE_TEXT}</experience_candidate>`,
      },
    }),
  )

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)
  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })

  await page.getByPlaceholder('Ask AI to modify your document...').fill('Story time')
  await page.getByRole('button', { name: 'Send' }).click()

  await page.getByTestId('experience-candidate-save').click()

  const req = await expRequest
  expect(req.postDataJSON()).toMatchObject({ text: CANDIDATE_TEXT })
})

test('clicking Dismiss removes the card without making any backend request', async ({ page }) => {
  await mockBase(page)
  await page.route(`**/api/jobs/${JOB_ID}/themes/${THEME_ID}/experience`, (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      json: {
        content: `Got it.\n<experience_candidate theme="${THEME_NAME}">${CANDIDATE_TEXT}</experience_candidate>`,
      },
    }),
  )

  await page.goto(`/jobs/${JOB_ID}/cover-letter`)
  await expect(page.getByTestId('editor-content')).toBeVisible({ timeout: 8000 })

  await page.getByPlaceholder('Ask AI to modify your document...').fill('Story')
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.getByTestId('experience-candidate-card')).toBeVisible({ timeout: 8000 })

  // Listen for any PUT request to the experience endpoint — none should fire on Dismiss.
  let putFired = false
  page.on('request', (req) => {
    if (
      req.url().includes(`/api/jobs/${JOB_ID}/themes/${THEME_ID}/experience`) &&
      req.method() === 'PUT'
    ) {
      putFired = true
    }
  })

  await page.getByTestId('experience-candidate-dismiss').click()

  await expect(page.getByTestId('experience-candidate-card')).toHaveCount(0)
  expect(putFired).toBe(false)
})
